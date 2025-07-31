import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, User, Mail, Lock, ArrowRight, GraduationCap, BookOpen } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import googleIcon from '../../assets/google-icon-logo.svg';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['tutor', 'student'])
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { register: registerUser, socialLogin, error, clearError, setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for Google auth data
  const isGoogleAuth = searchParams.get('isGoogleAuth') === 'true';
  const googleToken = searchParams.get('token');
  const googleEmail = searchParams.get('email');
  const googleName = searchParams.get('name');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  // Set Google auth data if available
  useEffect(() => {
    if (isGoogleAuth && googleEmail && googleName) {
      setValue('email', googleEmail);
      setValue('name', googleName);
      
      // Generate a random password for Google auth users
      // This won't be used for login but is required by the form validation
      const randomPassword = Math.random().toString(36).slice(-10);
      setValue('password', randomPassword);
      setValue('confirmPassword', randomPassword);
    } else {
      // Ensure password fields are empty for regular registration
      setValue('password', '');
      setValue('confirmPassword', '');
    }
  }, [isGoogleAuth, googleEmail, googleName, setValue]);

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      if (!data.role) {
        throw new Error('Please select a role (Student or Tutor)');
      }
      setIsSubmitting(true);
      clearError();

      if (isGoogleAuth && googleToken) {
        // Update Google user's role
        const response = await axios.put(
          `${API_URL}/api/auth/google/update-role`,
          { role: data.role },
          {
            headers: {
              Authorization: `Bearer ${googleToken}`
            }
          }
        );
        
        // Save token and set auth header
        localStorage.setItem('token', googleToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${googleToken}`;
        
        // Update user in context
        setUser(response.data.user);
        
        // Redirect based on role
        if (data.role === 'tutor') {
          navigate('/tutor/profile');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        // Normal registration
        await registerUser(data.name, data.email, data.password, data.role);
        
        // Redirect based on role
        if (data.role === 'tutor') {
          navigate('/tutor/profile');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
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
    <div className="min-h-screen flex bg-white overflow-y-auto">
      {/* Left Column - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
          {/* Overlay Pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-8">
          {/* Welcome Text */}
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold mb-3">
              Join VerifiedTutors
            </h1>
            <p className="text-base text-blue-100 leading-relaxed">
              Start your journey as a student seeking knowledge or a tutor sharing expertise. 
              Create your account and unlock endless learning possibilities.
            </p>
          </div>
          
          {/* Features */}
          <div className="mt-8 grid grid-cols-1 gap-4 max-w-md">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-blue-100">Find qualified tutors or become one</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-blue-100">Flexible learning schedules</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-blue-100">Verified and secure platform</span>
            </div>
          </div>
        </div>
      </div>

             {/* Right Column - Register Form */}
       <div className="flex-1 flex items-start justify-center p-6 lg:p-8 pt-8">
         <div className="w-full max-w-md">
           {/* Header Section */}
           <div className="text-center mb-6 mt-8">
             <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight mb-2">
               Create your account
             </h2>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm p-3 rounded-xl flex items-start border border-red-200 shadow-sm animate-fade-in mb-4">
              <AlertCircle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {/* Main Form Container */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-gray-200/50">
            {/* Social Login Section */}
            <div className="mb-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200/60 rounded-xl shadow-sm bg-gradient-to-r from-gray-50 to-gray-100 text-sm font-medium text-gray-700 hover:from-gray-100 hover:to-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
              >
                <img src={googleIcon} alt="Google" className="h-4 w-4 mr-2" />
                Continue with Google
              </button>
            </div>
            
            {/* Divider */}
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/60"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white/95 text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      {...register('name')}
                      className="block w-full pl-9 pr-3 py-2.5 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className="block w-full pl-9 pr-3 py-2.5 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      {...register('password')}
                      className="block w-full pl-9 pr-3 py-2.5 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.password.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                      className="block w-full pl-9 pr-3 py-2.5 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    I want to join as
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div 
                      className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all duration-300 hover:shadow-md ${
                        selectedRole === 'student' 
                          ? 'border-blue-500 bg-blue-50/80 shadow-sm ring-2 ring-blue-200' 
                          : 'border-gray-200/60 hover:border-blue-200 hover:bg-gray-50/80'
                      }`}
                      onClick={() => setValue('role', 'student')}
                    >
                      <input 
                        type="radio" 
                        id="role-student" 
                        value="student" 
                        {...register('role')} 
                        className="sr-only"
                      />
                      <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <span className="block font-semibold text-gray-900 text-sm mb-1">Student</span>
                      <span className="text-xs text-gray-500">Looking for tutors</span>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all duration-300 hover:shadow-md ${
                        selectedRole === 'tutor' 
                          ? 'border-blue-500 bg-blue-50/80 shadow-sm ring-2 ring-blue-200' 
                          : 'border-gray-200/60 hover:border-blue-200 hover:bg-gray-50/80'
                      }`}
                      onClick={() => setValue('role', 'tutor')}
                    >
                      <input 
                        type="radio" 
                        id="role-tutor" 
                        value="tutor" 
                        {...register('role')} 
                        className="sr-only"
                      />
                      <GraduationCap className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <span className="block font-semibold text-gray-900 text-sm mb-1">Tutor</span>
                      <span className="text-xs text-gray-500">Offer tutoring</span>
                    </div>
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.role.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
          
                     {/* Footer Text */}
           <p className="text-xs text-center text-gray-500 mt-4 mb-8">
             By signing up, you agree to our{' '}
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

export default RegisterPage;