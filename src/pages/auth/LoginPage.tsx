import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, Mail, Lock, Chrome, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, socialLogin, error, clearError, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const from = location.state?.from?.pathname || '/';

  // Check for Google auth data
  const isGoogleAuth = searchParams.get('isGoogleAuth') === 'true';
  const googleToken = searchParams.get('token');
  const googleEmail = searchParams.get('email');
  const googleName = searchParams.get('name');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  // Handle Google auth data
  useEffect(() => {
    if (isGoogleAuth && googleToken && googleEmail && googleName) {
      // Redirect to role selection
      navigate('/register', {
        state: {
          token: googleToken,
          email: googleEmail,
          name: googleName,
          isGoogleAuth: true
        },
        replace: true
      });
    }
    
    // Check for error in URL params
    const error = searchParams.get('error');
    if (error) {
      clearError();
      setUser(null);
      localStorage.removeItem('token');
    }
  }, [isGoogleAuth, googleToken, googleEmail, googleName, navigate, searchParams, clearError, setUser]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    try {
      setIsSubmitting(true);
      clearError();
      await socialLogin(provider);
    } catch (err) {
      console.error('Social login error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-lg w-full relative z-10 px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight mb-3">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm p-4 rounded-xl flex items-start border border-red-200 shadow-sm animate-fade-in mb-6">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {/* Social Login Section */}
        <div className="mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white/80 backdrop-blur-sm text-sm font-medium text-gray-700 hover:bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
          >
            <Chrome className="h-5 w-5 mr-2 text-red-500" />
            Continue with Google
          </button>
        </div>
        
        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>
        
        {/* Main Form Container */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in to your account</h3>
            <p className="text-sm text-gray-600">Enter your credentials to access your account</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Content Area with Consistent Height */}
            <div className="min-h-[240px] flex flex-col justify-between">
              {/* Form Fields */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      {...register('password')}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8 mt-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer Text */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;