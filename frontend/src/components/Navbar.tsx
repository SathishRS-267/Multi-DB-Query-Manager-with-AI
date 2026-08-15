import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Database className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Multi-DB Query Manager
              </span>
            </Link>
          </div>

          {/* Icons + Logout */}
          <div className="flex items-center space-x-4">
            <Link to="/settings" className="text-gray-600 hover:text-gray-900">
              <Settings className="h-5 w-5" />
            </Link>

            <Link to="/profile" className="text-gray-600 hover:text-gray-900">
              <User className="h-5 w-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
