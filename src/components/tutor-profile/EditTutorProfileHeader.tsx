import React from 'react';
import { X, Save } from 'lucide-react';

interface EditTutorProfileHeaderProps {
  hasChanges: boolean;
  onDiscard: () => void;
  onSave: () => void;
  isSubmitting?: boolean;
}

const EditTutorProfileHeader: React.FC<EditTutorProfileHeaderProps> = ({
  hasChanges,
  onDiscard,
  onSave,
  isSubmitting = false
}) => {
  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Edit Profile
        </h1>
      </div>

      {/* Floating Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50 pb-4">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">You have unsaved changes</span>
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
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
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