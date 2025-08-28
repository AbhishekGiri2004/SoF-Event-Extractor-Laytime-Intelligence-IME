import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TopNav = () => {
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
    }
    
    const handleProfileUpdate = (event) => {
      setUser(event.detail);
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);



  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/signin');
  };

  return (
    <header className="bg-blue-900 text-white shadow-lg">
      {/* Main Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-900 font-bold text-xl">IME</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Integrated Maritime Exchange</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-4 h-4">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v2H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97l-6-1.95-6 1.95V6z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-blue-200">BROKER</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - User Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-blue-200 hover:text-white transition-colors" aria-label="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-blue-200">{user?.role || 'Broker'}</p>
              </div>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="text-blue-200 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-6 top-20 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Home
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Row - Removed Profile button */}
      <div className="px-6 pb-4">
        <div className="flex justify-end space-x-4">
          {/* Profile button removed as requested */}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
