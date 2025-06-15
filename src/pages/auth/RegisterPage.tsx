import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, User, Mail, Lock, Chrome, ArrowRight, ArrowLeft, GraduationCap, BookOpen } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';

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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
    setValue,
    trigger
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  // Set Google auth data if available
  useEffect(() => {
    if (isGoogleAuth && googleEmail && googleName) {
      setValue('email', googleEmail);
      setValue('name', googleName);
      // Skip to role selection step
      setCurrentStep(3);
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

  const nextStep = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = await trigger(['name', 'email']);
        break;
      case 2:
        isValid = await trigger(['password', 'confirmPassword']);
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              currentStep > index + 1
                ? 'bg-primary-600 text-white shadow-lg'
                : currentStep === index + 1
                ? 'bg-primary-600 text-white shadow-lg ring-4 ring-primary-100'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {currentStep > index + 1 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-16 h-1 transition-all duration-300 ${
                currentStep > index + 1 ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name')}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.email.message}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border-2 rounded-xl p-6 cursor-pointer text-center transition-all duration-300 hover:shadow-lg ${
                    selectedRole === 'student' 
                      ? 'border-primary-500 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
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
                  <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                  <span className="block font-medium text-gray-900 text-lg">Student</span>
                  <span className="text-sm text-gray-500 mt-1">Looking for tutors</span>
                </div>
                
                <div 
                  className={`border-2 rounded-xl p-6 cursor-pointer text-center transition-all duration-300 hover:shadow-lg ${
                    selectedRole === 'tutor' 
                      ? 'border-primary-500 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
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
                  <GraduationCap className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                  <span className="block font-medium text-gray-900 text-lg">Tutor</span>
                  <span className="text-sm text-gray-500 mt-1">Offer tutoring services</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full space-y-8 relative">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm p-4 rounded-xl flex items-start border border-red-200 shadow-sm animate-fade-in">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
          >
            <Chrome className="h-5 w-5 mr-2 text-red-500" />
            Continue with Google
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {renderStepIndicator()}
          {renderStepContent()}

          <div className="flex justify-between pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            )}
          </div>
          
          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500 transition-colors duration-200">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500 transition-colors duration-200">
              Privacy Policy
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;