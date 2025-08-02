import { useState, useEffect } from 'react';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#007bff",
  });

  // Mock data for demonstration
  const mockUsers = [
    { _id: "1", name: "John Doe", email: "john@example.com", role: "user", createdAt: new Date().toISOString() },
    { _id: "2", name: "Jane Smith", email: "jane@example.com", role: "agent", createdAt: new Date().toISOString() },
    { _id: "3", name: "Admin User", email: "admin@example.com", role: "admin", createdAt: new Date().toISOString() },
  ];

  const mockCategories = [
    { _id: "1", name: "Technical Support", description: "Technical issues and bugs", color: "#dc3545", createdBy: { name: "Admin" } },
    { _id: "2", name: "General Inquiry", description: "General questions and information", color: "#28a745", createdBy: { name: "Admin" } },
    { _id: "3", name: "Billing", description: "Payment and billing related issues", color: "#ffc107", createdBy: { name: "Admin" } },
  ];

  // Mock ticket statistics
  const ticketStats = {
    totalTickets: 156,
    responded: 89,
    inProcess: 42,
    waiting: 25,
    avgResponseTime: "2.3 hours",
    satisfactionRate: "94%"
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "categories") {
      fetchCategories();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setCategories(mockCategories);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUsers(users.map((user) => (user._id === userId ? { ...user, role: newRole } : user)));
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        setUsers(users.filter((user) => user._id !== userId));
      } catch (error) {
        console.error("Error deactivating user:", error);
      }
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const newCat = {
        _id: Date.now().toString(),
        ...newCategory,
        createdBy: { name: "Admin" }
      };
      setCategories([...categories, newCat]);
      setNewCategory({ name: "", description: "", color: "#007bff" });
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        setCategories(categories.filter((cat) => cat._id !== categoryId));
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Panel
            </h1>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "dashboard"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Category Management
              </button>
            </nav>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Ticket Statistics Overview */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">QuickDesk Ticket Analytics</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Tickets */}
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-100">Total Tickets</p>
                          <p className="text-2xl font-bold">{ticketStats.totalTickets}</p>
                        </div>
                      </div>
                    </div>

                    {/* Responded Tickets */}
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-100">Tickets Responded</p>
                          <p className="text-2xl font-bold">{ticketStats.responded}</p>
                        </div>
                      </div>
                    </div>

                    {/* In Process Tickets */}
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-yellow-100">In Process</p>
                          <p className="text-2xl font-bold">{ticketStats.inProcess}</p>
                        </div>
                      </div>
                    </div>

                    {/* Waiting Tickets */}
                    <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-red-100">Waiting Response</p>
                          <p className="text-2xl font-bold">{ticketStats.waiting}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Response Time & Satisfaction */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Average Response Time</p>
                          <p className="text-2xl font-bold text-gray-900">{ticketStats.avgResponseTime}</p>
                        </div>
                        <div className="text-green-500">
                          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Customer Satisfaction</p>
                          <p className="text-2xl font-bold text-gray-900">{ticketStats.satisfactionRate}</p>
                        </div>
                        <div className="text-green-500">
                          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 002.5-2.5V6a2.5 2.5 0 00-2.5-2.5H9m-7 14h18" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Ticket Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-900">New ticket created by John Doe</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-900">Ticket #1234 resolved by Agent Smith</p>
                          <p className="text-xs text-gray-500">15 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-900">Ticket #1233 awaiting customer response</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-900">Priority ticket assigned to Agent Jones</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">User Management</h2>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading users...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="user">User</option>
                                <option value="agent">Agent</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeactivateUser(user._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Deactivate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              {/* Create Category Form */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Category</h3>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Category Name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="color"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                        className="border border-gray-300 rounded-md h-10 w-20 cursor-pointer"
                      />
                    </div>
                    <textarea
                      placeholder="Description (optional)"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      Create Category
                    </button>
                  </form>
                </div>
              </div>

              {/* Categories List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Existing Categories</h2>
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading categories...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div key={category._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                              <p className="text-sm text-gray-500">{category.description}</p>
                              <small className="text-xs text-gray-400">Created by {category.createdBy?.name}</small>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
