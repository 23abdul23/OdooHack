import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [userType, setUserType] = useState('client'); // 'admin' or 'client'
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Hardcoded credentials
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  const CLIENT_CREDENTIALS = {
    username: 'client',
    password: 'client123'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check credentials based on user type
    let isValidCredentials = false;
    
    if (userType === 'admin') {
      isValidCredentials = 
        formData.username === ADMIN_CREDENTIALS.username && 
        formData.password === ADMIN_CREDENTIALS.password;
    } else {
      isValidCredentials = 
        formData.username === CLIENT_CREDENTIALS.username && 
        formData.password === CLIENT_CREDENTIALS.password;
    }

    if (isValidCredentials) {
      // Call the onLogin function passed from parent component
      onLogin(userType);
    } else {
      setError('Invalid username or password');
    }
  };

  const toggleUserType = (type) => {
    setUserType(type);
    // Reset form when switching user types
    setFormData({
      username: '',
      password: ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {/* User Type Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => toggleUserType('client')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                userType === 'client'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Client Login
            </button>
            <button
              type="button"
              onClick={() => toggleUserType('admin')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                userType === 'admin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin Login
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Credential Hints */}
          <div className="rounded-md bg-blue-50 p-4">
            <div className="text-sm text-blue-700">
              <p className="font-medium">Demo Credentials:</p>
              {userType === 'admin' ? (
                <p>Username: admin | Password: admin123</p>
              ) : (
                <p>Username: client | Password: client123</p>
              )}
            </div>
          </div>

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {userType === 'admin' ? (
                  <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              Sign in as {userType === 'admin' ? 'Administrator' : 'Client'}
            </button>
          </div>

          {/* Visual indicator for current login type */}
          <div className="text-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              userType === 'admin' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {userType === 'admin' ? '🔒 Admin Access' : '👤 Client Access'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
