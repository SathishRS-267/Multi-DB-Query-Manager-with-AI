import React from 'react';
import { Database, Trash2 } from 'lucide-react';

const Settings = () => {
  const connections = [
    {
      id: 1,
      name: 'Production DB',
      type: 'postgres',
      host: 'prod-db.example.com',
      database: 'production'
    },
    {
      id: 2,
      name: 'Analytics MongoDB',
      type: 'mongodb',
      connectionString: 'mongodb://analytics.example.com'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">
            Database Connections
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your database connections and credentials
          </p>
        </div>

        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {connections.map((connection) => (
              <li key={connection.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {connection.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {connection.type === 'postgres'
                          ? `${connection.host}/${connection.database}`
                          : connection.connectionString}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Edit
                    </button>
                    <button className="text-sm font-medium text-red-600 hover:text-red-500">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">
            Application Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure general application preferences
          </p>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  Enable AI suggestions in Query Editor
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  Auto-save queries
                </span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Query History Retention
              </label>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option>7 days</option>
                <option>30 days</option>
                <option>90 days</option>
                <option>1 year</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;



