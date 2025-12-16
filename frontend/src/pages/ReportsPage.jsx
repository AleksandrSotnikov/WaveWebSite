import { useState } from 'react';
import api from '../services/api';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('trainer');
  const [selectedId, setSelectedId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [format, setFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [clients, setClients] = useState([]);

  const loadResources = async () => {
    try {
      const [trainRes, clientRes] = await Promise.all([
        api.get('/trainers'),
        api.get('/clients'),
      ]);
      setTrainers(trainRes.data.data);
      setClients(clientRes.data.data);
    } catch (err) {
      console.error('Failed to load resources');
    }
  };

  useState(() => {
    loadResources();
  }, []);

  const generateReport = async (e) => {
    e.preventDefault();
    setError('');
    setData(null);
    setLoading(true);

    try {
      let url = '';
      const params = new URLSearchParams();

      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      params.append('format', format);

      if (reportType === 'trainer') {
        if (!selectedId) {
          setError('Select a trainer');
          setLoading(false);
          return;
        }
        url = `/reports/trainer/${selectedId}?${params}`;
      } else if (reportType === 'client') {
        if (!selectedId) {
          setError('Select a client');
          setLoading(false);
          return;
        }
        url = `/reports/client/${selectedId}?${params}`;
      } else if (reportType === 'date') {
        if (!dateFrom || !dateTo) {
          setError('Select date range');
          setLoading(false);
          return;
        }
        url = `/reports/date?${params}`;
      }

      const response = await api.get(url, { responseType: format === 'json' ? 'json' : 'blob' });

      if (format === 'json') {
        setData(response.data.data);
      } else {
        // Download file
        const contentType =
          format === 'csv'
            ? 'text/csv'
            : format === 'pdf'
              ? 'application/pdf'
              : 'text/html';
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setError('Report downloaded!');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">📈 Reports</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Generate Report</h2>

            {error && (
              <div className={`p-4 rounded ${
                error === 'Report downloaded!' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <form onSubmit={generateReport} className="space-y-4">
              {/* Report Type */}
              <div>
                <label className="block font-semibold mb-2">Report Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="trainer"
                      checked={reportType === 'trainer'}
                      onChange={(e) => {
                        setReportType(e.target.value);
                        setSelectedId('');
                      }}
                      className="mr-2"
                    />
                    Trainer Income
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="client"
                      checked={reportType === 'client'}
                      onChange={(e) => {
                        setReportType(e.target.value);
                        setSelectedId('');
                      }}
                      className="mr-2"
                    />
                    Client Attendance
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="date"
                      checked={reportType === 'date'}
                      onChange={(e) => {
                        setReportType(e.target.value);
                        setSelectedId('');
                      }}
                      className="mr-2"
                    />
                    Date Range
                  </label>
                </div>
              </div>

              {/* Trainer/Client Selection */}
              {(reportType === 'trainer' || reportType === 'client') && (
                <div>
                  <label className="block font-semibold mb-2">
                    {reportType === 'trainer' ? 'Select Trainer' : 'Select Client'}
                  </label>
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose...</option>
                    {(reportType === 'trainer' ? trainers : clients).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Export Format */}
              <div>
                <label className="block font-semibold mb-2">Export Format</label>
                <div className="flex gap-4">
                  {['json', 'csv', 'pdf', 'html'].map((fmt) => (
                    <label key={fmt} className="flex items-center">
                      <input
                        type="radio"
                        value={fmt}
                        checked={format === fmt}
                        onChange={(e) => setFormat(e.target.value)}
                        className="mr-2"
                      />
                      {fmt.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>
        </div>

        {/* Help Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📝 Help</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Trainer Report:</strong> Income breakdown by period
            </div>
            <div>
              <strong>Client Report:</strong> Attendance history with subscription details
            </div>
            <div>
              <strong>Date Report:</strong> All sessions in date range
            </div>
            <hr className="my-3" />
            <div>
              <strong>Formats:</strong>
              <ul className="mt-2 space-y-1">
                <li>✓ JSON - Structured data</li>
                <li>✓ CSV - Excel compatible</li>
                <li>✓ PDF - Document</li>
                <li>✓ HTML - Webpage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Data Display */}
      {data && format === 'json' && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Report Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
