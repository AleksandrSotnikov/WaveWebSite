import { useState, useEffect } from 'react';
import api from '../services/api';

export default function SchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [clients, setClients] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClients, setSelectedClients] = useState([]);
  const [formData, setFormData] = useState({
    trainer_id: '',
    date_time: '',
    timezone: 'UTC+6',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessRes, trainRes, clientRes, subRes] = await Promise.all([
        api.get(`/sessions?date_from=${getMonthStart()}&date_to=${getMonthEnd()}`),
        api.get('/trainers'),
        api.get('/clients'),
        api.get('/subscriptions?status=active'),
      ]);
      setSessions(sessRes.data.data);
      setTrainers(trainRes.data.data);
      setClients(clientRes.data.data);
      setSubscriptions(subRes.data.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getMonthStart = () => {
    const date = new Date(currentDate);
    date.setDate(1);
    return date.toISOString().split('T')[0];
  };

  const getMonthEnd = () => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return date.toISOString().split('T')[0];
  };

  const handleClientToggle = (clientId) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedClients.length === 0) {
      setError('Select at least one client');
      return;
    }

    try {
      const subscriptionIds = selectedClients.map((clientId) => {
        const activeSubForClient = subscriptions.find((sub) => sub.client_id === clientId && sub.status === 'active');
        return activeSubForClient?.id;
      });

      await api.post('/sessions', {
        ...formData,
        trainer_id: parseInt(formData.trainer_id),
        clients: selectedClients,
        subscriptions: subscriptionIds.filter(Boolean),
      });

      setFormData({ trainer_id: '', date_time: '', timezone: 'UTC+6', notes: '' });
      setSelectedClients([]);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create session');
    }
  };

  const handleDeleteSession = async (id) => {
    if (confirm('Delete this session?')) {
      try {
        await api.delete(`/sessions/${id}`);
        loadData();
      } catch (err) {
        alert('Failed to delete session');
      }
    }
  };

  const getSessions ForDate = (date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date_time).toDateString();
      return sessionDate === date.toDateString();
    });
  };

  const getDaysInMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];
    const weeks = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-100 p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const daySessions = getSessionsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`border p-2 min-h-24 ${
            isToday ? 'bg-blue-50 border-blue-400' : 'bg-white'
          } hover:bg-gray-50 transition`}
        >
          <div className="font-semibold text-sm mb-1">{day}</div>
          {daySessions.map((session) => {
            const trainer = trainers.find((t) => t.id === session.trainer_id);
            return (
              <div
                key={session.id}
                className="bg-green-100 text-green-800 text-xs p-1 rounded mb-1 cursor-pointer hover:bg-green-200"
                onClick={() => handleDeleteSession(session.id)}
              >
                <div className="font-semibold truncate">{trainer?.full_name || 'Unknown'}</div>
                <div className="truncate">{session.attendees?.length || 0} clients</div>
              </div>
            );
          })}
        </div>
      );
    }

    // Distribute days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const weeks = renderCalendar();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">📅 Schedule</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Create Session
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          ← Previous
        </button>
        <h2 className="text-2xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Next →
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
        <div className="grid grid-cols-7 gap-0 border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-blue-600 text-white p-4 font-semibold text-center">
              {day}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7">
            {week}
          </div>
        ))}
      </div>

      {/* Create Session Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Create New Session</h2>

          <select
            value={formData.trainer_id}
            onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.full_name} - {trainer.specialization}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="datetime-local"
              value={formData.date_time}
              onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC+6">UTC+6 (Asia/Almaty)</option>
              <option value="UTC+0">UTC+0</option>
              <option value="UTC+3">UTC+3 (Moscow)</option>
            </select>
          </div>

          <textarea
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />

          <div>
            <h3 className="font-semibold mb-2">Select Clients (must have active subscription)</h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {clients.map((client) => {
                const hasActiveSubscription = subscriptions.some(
                  (sub) => sub.client_id === client.id && sub.status === 'active'
                );
                return (
                  <label key={client.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleClientToggle(client.id)}
                      disabled={!hasActiveSubscription}
                      className="w-4 h-4 rounded"
                    />
                    <span className={!hasActiveSubscription ? 'text-gray-400' : ''}>
                      {client.full_name} {!hasActiveSubscription && '(no active sub)'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
              Create Session
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
