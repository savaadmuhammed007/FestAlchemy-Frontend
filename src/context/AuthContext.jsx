import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : 'https://festalchemy-backend.onrender.com')).replace(/\/$/, '');



export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // If token and user are already cached, avoid initial loading spinner
  const [loading, setLoading] = useState(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    return Boolean(savedToken && !savedUser);
  });

  // Sync token and user changes to localStorage
  const updateAuth = (newToken, newUser) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }

    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    } else {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Revalidate auth status in the background on initial application mount
  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me/`, {
          headers: {
            'Authorization': `Token ${currentToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else if (res.status === 401 || res.status === 403) {
          // Invalidate bad or expired token
          updateAuth(null, null);
        }
      } catch (err) {
        console.error("Auth background check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login handler — instantaneous state commitment
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

      updateAuth(data.token, data.user);
      setLoading(false);
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

      updateAuth(data.token, data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      console.error("Signup failed:", err);
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    const activeToken = token || localStorage.getItem('token');
    try {
      if (activeToken) {
        fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${activeToken}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      updateAuth(null, null);
      setLoading(false);
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
