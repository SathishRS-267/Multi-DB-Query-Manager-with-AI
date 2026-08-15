// // 


// import React, { createContext, useContext, useState, useEffect } from 'react';

// interface User {
//   id: string;
//   name: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (userData: User, token: string) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);

//   // Check if there is a user in localStorage on initial load
//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (storedToken) {
//       // Retrieve user data using token (e.g., from an API or decoded token)
//       // For simplicity, let's assume user data is available in localStorage as well.
//       // You can fetch user data here if necessary (e.g., using an API).
//       const storedUser: User = JSON.parse(localStorage.getItem("user") || '{}');
//       setUser(storedUser);
//     }
//   }, []);

//   const login = (userData: User, token: string) => {
//     setUser(userData);
//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(userData));
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }


// import React, { createContext, useContext, useState, useEffect } from 'react';

// interface User {
//   id: string;
//   name: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (userData: User, token: string) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);

//   // Load user from localStorage when app starts
//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     const storedUser = localStorage.getItem("user");

//     if (storedToken && storedUser) {
//       try {
//         const parsedUser: User = JSON.parse(storedUser);
//         setUser(parsedUser);
//       } catch (error) {
//         console.error("Error parsing user from localStorage", error);
//       }
//     }
//   }, []);

//   const login = (userData: User, token: string) => {
//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(userData));
//     setUser(userData); // Update user state
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }


import React, { createContext, useContext, useState, useEffect } from 'react';


interface User {
  id: string;
  name: string;
  email:string;
}

interface AuthContextType {
  user: User | null;
  //login: (userData: User, token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
 // updateUserProfile: (userData: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Update AuthContext.tsx to include authorization headers in requests



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
 

  // Load user from localStorage when app starts
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
      }
    }
  }, []);

  // const login = (userData: User, token: string) => {
  //   localStorage.setItem("token", token);
  //   localStorage.setItem("user", JSON.stringify(userData));
  //   setUser(userData);
  // };


  

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email); // FastAPI's OAuth2PasswordRequestForm uses "username"
    formData.append("password", password);
  
    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        body: formData,
        credentials: "include", // to include cookies (e.g., access_token)
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
  
      if (!res.ok) {
        throw new Error("Login failed");
      }
  
      const data = await res.json();
  
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  

  const logout = async () => {
    try {
      await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include",
      });
  
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
