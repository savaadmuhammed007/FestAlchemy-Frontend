import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_BASE_URL = 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token changes to localStorage
  const updateToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setToken(newToken);
  };

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Invalidate bad token
          updateToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        // Do not delete token on network error, just handle gracefully
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  // Login handler
  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      updateToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  // Signup handler
  const signup = async (signupData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register-admin/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      updateToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("Signup failed:", err);
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      updateToken(null);
      setUser(null);
    }
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    signup,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isJudge: user?.role === 'judge',
    isTeamLead: user?.role === 'teamlead',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
