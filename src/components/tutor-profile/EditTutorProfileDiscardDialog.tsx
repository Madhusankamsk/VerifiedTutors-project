import React from 'react';

interface EditTutorProfileDiscardDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const EditTutorProfileDiscardDialog: React.FC<EditTutorProfileDiscardDialogProps> = ({
  isOpen,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Discard Changes?</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to discard all changes? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTutorProfileDiscardDialog; 