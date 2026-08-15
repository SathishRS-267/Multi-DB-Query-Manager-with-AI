// import React from 'react';
// import { User, Mail, Key } from 'lucide-react';

// const Profile = () => {
//   return (
//     <div className="max-w-3xl mx-auto">
//       <div className="bg-white shadow rounded-lg">
//         <div className="px-4 py-5 sm:px-6">
//           <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
//           <p className="mt-1 text-sm text-gray-500">
//             Manage your account settings and preferences
//           </p>
//         </div>

//         <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
//           <div className="space-y-8">
//             <div>
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <User className="h-16 w-16 rounded-full bg-gray-200 p-2" />
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-medium text-gray-900">
//                     Profile Picture
//                   </h3>
//                   <div className="mt-1 flex items-center space-x-4">
                
//                     <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
//                       Change
//                     </button>
//                     <button className="text-sm text-gray-500 hover:text-gray-700">
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-6">
//               <div>
//                 <label
//                   htmlFor="name"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Full Name
//                 </label>
//                 <div className="mt-1">
//                   <input
//                     type="text"
//                     name="name"
//                     id="name"
//                     className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Email
//                 </label>
//                 <div className="mt-1">
//                   <input
//                     type="email"
//                     name="email"
//                     id="email"
//                     className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-medium text-gray-900">
//                   Change Password
//                 </h3>
//                 <div className="mt-4 space-y-4">
//                   <div>
//                     <label
//                       htmlFor="current-password"
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Current Password
//                     </label>
//                     <div className="mt-1">
//                       <input
//                         type="password"
//                         name="current-password"
//                         id="current-password"
//                         className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="new-password"
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       New Password
//                     </label>
//                     <div className="mt-1">
//                       <input
//                         type="password"
//                         name="new-password"
//                         id="new-password"
//                         className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="confirm-password"
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Confirm New Password
//                     </label>
//                     <div className="mt-1">
//                       <input
//                         type="password"
//                         name="confirm-password"
//                         id="confirm-password"
//                         className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="pt-6">
//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;
import React, { useEffect, useState } from "react";
import { UserIcon, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setUsername(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <UserIcon className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Your Profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="block w-full py-2 text-gray-700">
                  {username}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="block w-full py-2 text-gray-700">
                  {email}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {/* Account created on {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"} */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;