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
      <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8 px-4 sm:px-0">
        <div>
          {/* <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Edit Profiles
          </h1> */}
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
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
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isComplete ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 font-medium">{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-11 sm:bottom-8 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg z-[60] safe-area-pb">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium text-sm sm:text-base">You have unsaved changes</span>
                {!isComplete && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full hidden sm:inline-block">
                    Complete all sections to submit for review
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {!isComplete && (
                  <div className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-center sm:hidden">
                    Complete all sections to submit for review
                  </div>
                )}
                <div className="flex gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={onDiscard}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Discard
                  </button>
                  <button
                    type="submit"
                    form="profile-form"
                    disabled={isSubmitting}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium ${
                      isComplete
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                  >
                    <SaveIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {getSaveButtonText()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditTutorProfileHeader; 