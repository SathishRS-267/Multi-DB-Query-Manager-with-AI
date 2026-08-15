import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  MessageSquare,
  Database,
  Settings,
  User
} from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/editor', icon: Code2, label: 'Query Editor' },
    { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { to: '/profile', icon: User, label: 'Profile' },
    //{ to: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="mt-5 px-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <link.icon className="mr-3 h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;