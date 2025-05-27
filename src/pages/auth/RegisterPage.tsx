import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, User, Mail, Lock, Chrome, ArrowRight, ArrowLeft } from 'lucide-react';

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
  const { register: registerUser, socialLogin, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student'
    }
  });

  const selectedRole = watch('role');
  const name = watch('name');
  const email = watch('email');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      await registerUser(data.name, data.email, data.password, data.role);
      
      // Redirect based on role
      if (data.role === 'tutor') {
        navigate('/tutor/profile');
      } else {
        navigate('/student/dashboard');
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
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep > index + 1
                ? 'bg-blue-600 text-white'
                : currentStep === index + 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
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
              className={`w-16 h-1 ${
                currentStep > index + 1 ? 'bg-blue-600' : 'bg-gray-200'
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                  className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${
                    selectedRole === 'student' 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-300 hover:bg-gray-50'
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
                  <span className="block font-medium text-gray-900">Student</span>
                  <span className="text-xs text-gray-500">Looking for tutors</span>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${
                    selectedRole === 'tutor' 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-300 hover:bg-gray-50'
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
                  <span className="block font-medium text-gray-900">Tutor</span>
                  <span className="text-xs text-gray-500">Offer tutoring services</span>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-slide-up">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-lg flex items-start border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Chrome className="h-5 w-5 mr-2 text-red-500" />
            Continue with Google
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-500">
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
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            )}
          </div>
          
          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500 transition-colors">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;