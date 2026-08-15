// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Database, Settings, User } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     await logout();
//     navigate("/login"); // ✅ navigate here
//   };

//   return (
//     <nav className="bg-white border-b border-gray-200">
//       <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex">
//             <Link to="/" className="flex items-center">
//               <Database className="h-8 w-8 text-indigo-600" />
//               <span className="ml-2 text-xl font-bold text-gray-900">
//                 Unified SQL Editor
//               </span>
//             </Link>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <Link
//               to="/settings"
//               className="text-gray-600 hover:text-gray-900"
//             >
//               <Settings className="h-5 w-5" />
//             </Link>
//             <Link
//               to="/profile"
//               className="text-gray-600 hover:text-gray-900"
//             >
//               <User className="h-5 w-5" />
//             </Link>
//             <button
//               onClick={handleLogout}
//               className="text-sm font-medium text-gray-700 hover:text-gray-900"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, Settings, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Database className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Multi-DB Query Manager
              </span>
            </Link>
          </div>

          {/* Icons + Theme + Logout */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-300 dark:text-yellow-300" />
              )}
            </button>

            <Link to="/settings" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Settings className="h-5 w-5" />
            </Link>

            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <User className="h-5 w-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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


// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Database, Settings, User, Moon, Sun } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   // Check for user's saved preference or system preference on initial load
//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme === 'dark') {
//       setIsDarkMode(true);
//       document.documentElement.classList.add('dark');
//     } else if (savedTheme === 'light') {
//       setIsDarkMode(false);
//       document.documentElement.classList.remove('dark');
//     } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
//       setIsDarkMode(true);
//       document.documentElement.classList.add('dark');
//     }
//   }, []);

//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//     if (!isDarkMode) {
//       document.documentElement.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//     }
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate("/login");
//   };

//   return (
//     <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-200`}>
//       <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex">
//             <Link to="/" className="flex items-center">
//               <Database className={`h-8 w-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
//               <span className={`ml-2 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                 Unified SQL Editor
//               </span>
//             </Link>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={toggleTheme}
//               className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
//               aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
//             >
//               {isDarkMode ? (
//                 <Sun className="h-5 w-5" />
//               ) : (
//                 <Moon className="h-5 w-5" />
//               )}
//             </button>
//             <Link
//               to="/settings"
//               className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
//             >
//               <Settings className="h-5 w-5" />
//             </Link>
//             <Link
//               to="/profile"
//               className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
//             >
//               <User className="h-5 w-5" />
//             </Link>
//             <button
//               onClick={handleLogout}
//               className={`text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;