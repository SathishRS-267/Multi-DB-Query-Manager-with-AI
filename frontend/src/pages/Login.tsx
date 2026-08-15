import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database, EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Define types for our form errors
interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
  general?: string;
}

// Define types for our component
const Login: React.FC = () => {
  // State management
  const [isSignIn, setIsSignIn] = useState<boolean>(true);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Hooks
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email && !resetEmail && !isForgotPassword) {
      newErrors.email = "Email is required";
    } else if (
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
      (resetEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail))
    ) {
      newErrors.email = "Invalid email format";
    }

    // Password validation (skip for forgot password flow)
    if (!isForgotPassword) {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(password)) {
        newErrors.password = "Password must include uppercase, lowercase, and number";
      }
    }

    // Username validation (only for signup)
    if (!isSignIn && !isForgotPassword) {
      if (!username) {
        newErrors.username = "Username is required";
      } else if (username.length < 3) {
        newErrors.username = "Username must be at least 3 characters long";
      } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        newErrors.username = "Username can only contain letters, numbers, underscores, and hyphens";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle forgot password request
  const handleForgotPassword = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!resetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (response.ok) {
        setResetSent(true);
      } else {
        const data = await response.json();
        setErrors({ general: data.detail || "Error processing your request" });
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setErrors({
        general: err instanceof Error ? err.message : "Failed to connect to server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login/signup form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});

    // Validate form
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignIn) {
        // Use the login function from context directly
        await login(email, password);
        // If login is successful, navigate to home page
        navigate("/");
      } else {
        // For signup, still use fetch
        const response = await fetch("http://localhost:8080/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password
          }),
          credentials: "include", // Important for receiving cookies
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({
            general: data.detail || "Signup failed",
          });
          return;
        }

        // After successful signup, log the user in
        await login(email, password);
        navigate("/");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setErrors({
        general: err instanceof Error ? err.message : "Failed to connect to server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between sign in and sign up
  const toggleAuthMode = (): void => {
    setIsSignIn(!isSignIn);
    setErrors({});
  };

  // Render forgot password form
  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Database className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {resetSent ? (
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-600">Password Reset Email Sent</h3>
                <p className="mt-2 text-sm text-gray-600">
                  If an account exists with this email, you will receive a password reset link shortly.
                </p>
                <button
                  className="mt-4 text-indigo-600 hover:text-indigo-500"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetSent(false);
                  }}
                >
                  Return to login
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.email 
                        ? "border-red-300 text-red-900 focus:ring-red-500" 
                        : "border-gray-300 focus:ring-indigo-500"
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {errors.general && (
                  <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                    {errors.general}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                    onClick={() => setIsForgotPassword(false)}
                  >
                    Back to login
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send reset link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render login/signup form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Database className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignIn ? "Sign in to your account" : "Create your account"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isSignIn && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    errors.username 
                      ? "border-red-300 text-red-900 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.email 
                    ? "border-red-300 text-red-900 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-indigo-500"
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    errors.password 
                      ? "border-red-300 text-red-900 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                {errors.general}
              </div>
            )}

            {isSignIn && (
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setErrors({});
                  }}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isSignIn ? "Signing in..." : "Signing up...") 
                  : (isSignIn ? "Sign in" : "Sign up")}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button 
              className="text-indigo-600 hover:text-indigo-500"
              onClick={toggleAuthMode}
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
