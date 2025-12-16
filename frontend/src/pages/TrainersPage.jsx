import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', specialization: '', phone_number: '' });
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trainers');
      setTrainers(response.data.data);
    } catch (err) {
      setError('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/trainers', formData);
      setFormData({ full_name: '', specialization: '', phone_number: '' });
      setShowForm(false);
      loadTrainers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create trainer');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure? Trainer cannot have future sessions.')) {
      try {
        await api.delete(`/trainers/${id}`);
        loadTrainers();
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to delete trainer');
      }
    }
  };

  const handleViewIncome = (trainer) => {
    setSelectedTrainer(trainer);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">🧑‍🏫 Trainers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Trainer
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Specialization (e.g., Modern Dance)"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        {trainers.map((trainer) => (
          <div key={trainer.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{trainer.full_name}</h3>
            <p className="text-gray-600 text-sm mb-1">🎓 {trainer.specialization || 'N/A'}</p>
            <p className="text-gray-600 text-sm mb-4">📱 {trainer.phone_number || 'N/A'}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleViewIncome(trainer)}
                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition text-sm"
              >
                View Income
              </button>
              <button
                onClick={() => handleDelete(trainer.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">💰 Income for {selectedTrainer.full_name}</h2>
            <p className="text-gray-600 mb-4">Coming soon: Detailed income breakdown by month</p>
            <button
              onClick={() => setSelectedTrainer(null)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
