import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_STORAGE_KEY = 'auth_data';

export function useAuth(requiredRole) {
  const router = useRouter();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null
  });
  const isMounted = useRef(false);

  // Initialize mounted ref
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load initial auth state
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        if (isMounted.current) {
          // Check for both 'instructor' and 'faculty' roles when requiredRole is 'instructor'
          const isRoleMatch = requiredRole === 'instructor' 
            ? (authData.role === 'FACULTY' || authData.role === 'instructor')
            : requiredRole === 'admin'
              ? authData.role === 'admin'
              : authData.role === requiredRole;
            
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: isRoleMatch,
            isLoading: false,
            user: authData
          }));
        }
      } else {
        if (isMounted.current) {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false
          }));
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setAuthState(prev => ({
          ...prev,
          error: 'Failed to load authentication state',
          isLoading: false
        }));
      }
    }
  }, [requiredRole]);

  const login = useCallback(async (userData) => {
    if (!isMounted.current) return false;

    try {
      const authData = {
        userId: userData.userId,
        role: userData.role,
        name: userData.name,
        department: userData.department || '',
        year: userData.year || '',
        modules: userData.modules || [],
        facultyRole: userData.facultyRole
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

      if (isMounted.current) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          error: null,
          user: authData
        });
      }
      return true;
    } catch (err) {
      if (isMounted.current) {
        setAuthState(prev => ({
          ...prev,
          error: err.message,
          isAuthenticated: false
        }));
      }
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    if (!isMounted.current) return;

    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      if (isMounted.current) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          user: null
        });
        router.push('/login');
      }
    } catch (err) {
      if (isMounted.current) {
        setAuthState(prev => ({
          ...prev,
          error: err.message
        }));
      }
    }
  }, [router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push('/login');
    }
  }, [authState.isLoading, authState.isAuthenticated, router]);

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    user: authState.user,
    login,
    logout
  };
} 