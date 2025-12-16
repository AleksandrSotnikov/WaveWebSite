import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', messenger_link: '' });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setClients(response.data.data);
    } catch (err) {
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', formData);
      setFormData({ full_name: '', phone_number: '', messenger_link: '' });
      setShowForm(false);
      loadClients();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create client');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/clients/${id}`);
        loadClients();
      } catch (err) {
        alert('Failed to delete client');
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">👥 Clients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Client
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
            type="tel"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="Messenger Link (VK/Telegram)"
            value={formData.messenger_link}
            onChange={(e) => setFormData({ ...formData, messenger_link: e.target.value })}
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
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{client.full_name}</h3>
            <p className="text-gray-600 text-sm mb-1">📱 {client.phone_number || 'N/A'}</p>
            <p className="text-gray-600 text-sm mb-4">📨 {client.messenger_link || 'N/A'}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(client.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
