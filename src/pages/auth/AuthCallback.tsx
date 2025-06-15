import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login', { state: { error } });
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Update auth context
        setUser(user);
        
        // Redirect based on user role
        if (user.role === 'tutor') {
          navigate('/tutor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } catch (err) {
        console.error('Error processing auth callback:', err);
        navigate('/login', { state: { error: 'Failed to process authentication' } });
      }
    } else {
      navigate('/login', { state: { error: 'Invalid authentication response' } });
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 