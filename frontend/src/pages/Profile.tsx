import React, { useEffect, useState } from "react";
import { UserIcon, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Profile: React.FC = () => {
  const { user }: any = useAuth();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
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
