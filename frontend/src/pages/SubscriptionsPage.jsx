import { useState, useEffect } from 'react';
import api from '../services/api';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    client_id: '',
    type: 'limited',
    price: '',
    total_sessions: '',
    start_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, clientsRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/clients'),
      ]);
      setSubscriptions(subsRes.data.data);
      setClients(clientsRes.data.data);
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        client_id: parseInt(formData.client_id),
        price: parseFloat(formData.price),
      };
      if (formData.type === 'limited') {
        data.total_sessions = parseInt(formData.total_sessions);
      }
      await api.post('/subscriptions', data);
      setFormData({ client_id: '', type: 'limited', price: '', total_sessions: '', start_date: '' });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create subscription');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/subscriptions/${id}`);
        loadData();
      } catch (err) {
        alert('Failed to delete subscription');
      }
    }
  };

  const filteredSubs = subscriptions.filter((sub) => {
    const statusMatch = filterStatus === 'all' || sub.status === filterStatus;
    const typeMatch = filterType === 'all' || sub.type === filterType;
    return statusMatch && typeMatch;
  });

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">🎫 Subscriptions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Subscription
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="limited">Limited</option>
          <option value="unlimited">Unlimited</option>
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
          <select
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name}
              </option>
            ))}
          </select>

          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="limited">Limited</option>
            <option value="unlimited">Unlimited</option>
          </select>

          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {formData.type === 'limited' && (
            <input
              type="number"
              placeholder="Total Sessions"
              value={formData.total_sessions}
              onChange={(e) => setFormData({ ...formData, total_sessions: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}

          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubs.map((sub) => {
          const client = clients.find((c) => c.id === sub.client_id);
          const statusColor = sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
          return (
            <div key={sub.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{client?.full_name || 'Unknown'}</h3>
                  <p className="text-gray-600 text-sm">{sub.type === 'limited' ? `${sub.total_sessions} sessions` : 'Unlimited'}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${statusColor}`}>
                  {sub.status}
                </span>
              </div>
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p>💵 Price: {sub.price} rubles</p>
                {sub.type === 'limited' && <p>📴 Used: {sub.sessions_used}/{sub.total_sessions}</p>}
                <p>📅 Valid until: {new Date(sub.expiration_date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleDelete(sub.id)}
                className="w-full bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
