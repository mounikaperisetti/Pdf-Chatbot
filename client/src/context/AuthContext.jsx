import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import pdfService from '../services/pdfService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activePdf, setActivePdf] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load token and user from localStorage on init
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Fetch fresh profile details and PDFs
        try {
          const profileData = await authService.getProfile();
          setUser(profileData.user);
          localStorage.setItem('user', JSON.stringify(profileData.user));
          
          // Load user's pdfs list
          const pdfData = await pdfService.listPdfs();
          setPdfs(pdfData.pdfs);
        } catch (err) {
          console.error('Failed to initialize session profile:', err);
          // Token might have expired, clear it
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for unauthorized 401 events from Axios interceptor
    const handleUnauthorized = () => {
      handleLogout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const handleRegister = async (fullName, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(fullName, email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Clear PDFs list for new user
      setPdfs([]);
      setActivePdf(null);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Registration failed';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Fetch fresh list of PDFs
      try {
        const pdfData = await pdfService.listPdfs();
        setPdfs(pdfData.pdfs);
        if (pdfData.pdfs.length > 0) {
          setActivePdf(pdfData.pdfs[0]); // default to first PDF
        }
      } catch (pdfErr) {
        console.error('Failed to fetch PDFs on login:', pdfErr);
      }

      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid credentials';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setPdfs([]);
    setActivePdf(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const fetchPdfs = async () => {
    try {
      const pdfData = await pdfService.listPdfs();
      setPdfs(pdfData.pdfs);
      
      // Update active PDF if it was deleted
      if (activePdf) {
        const stillExists = pdfData.pdfs.some(p => p.id === activePdf.id);
        if (!stillExists) {
          setActivePdf(pdfData.pdfs.length > 0 ? pdfData.pdfs[0] : null);
        }
      } else if (pdfData.pdfs.length > 0) {
        setActivePdf(pdfData.pdfs[0]);
      }
    } catch (err) {
      console.error('Error fetching PDFs:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        pdfs,
        activePdf,
        setActivePdf,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
        fetchPdfs,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
