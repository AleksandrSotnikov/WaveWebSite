export default function DashboardPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">📊 Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Statistics Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Clients</h3>
          <p className="text-4xl font-bold text-blue-600">--</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Active Trainers</h3>
          <p className="text-4xl font-bold text-green-600">--</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Sessions This Month</h3>
          <p className="text-4xl font-bold text-purple-600">--</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Income</h3>
          <p className="text-4xl font-bold text-orange-600">₽--</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Coming Soon</h2>
        <p className="text-gray-600">Dashboard charts and analytics will be implemented in Phase 2.2</p>
      </div>
    </div>
  );
}
