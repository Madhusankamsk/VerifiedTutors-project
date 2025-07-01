import React from 'react';
import { X, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface EditTutorProfileHeaderProps {
  hasChanges: boolean;
  onDiscard: () => void;
  onSave: () => void;
  isSubmitting?: boolean;
  isComplete?: boolean;
  completionPercentage?: number;
}

const EditTutorProfileHeader: React.FC<EditTutorProfileHeaderProps> = ({
  hasChanges,
  onDiscard,
  onSave,
  isSubmitting = false,
  isComplete = false,
  completionPercentage = 0
}) => {
  const getSaveButtonText = () => {
    if (isSubmitting) {
      return isComplete ? 'Submitting for Review...' : 'Saving Draft...';
    }
    return isComplete ? 'Submit for Review' : 'Save Draft';
  };

  const getSaveButtonIcon = () => {
    return isComplete ? CheckCircle : Save;
  };

  const SaveIcon = getSaveButtonIcon();
  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Edit Profile
          </h1>
          <div className="mt-2 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isComplete ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                {isComplete ? 'Profile Complete' : 'Profile Incomplete'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isComplete ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50 pb-4">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">You have unsaved changes</span>
                {!isComplete && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    Complete all sections to submit for review
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onDiscard}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 mr-2" />
                  Discard Changes
                </button>
                <button
                  type="submit"
                  form="profile-form"
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-6 py-3 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isComplete
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  <SaveIcon className="w-5 h-5 mr-2" />
                  {getSaveButtonText()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditTutorProfileHeader; 