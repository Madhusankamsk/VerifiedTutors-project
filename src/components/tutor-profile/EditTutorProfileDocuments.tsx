import React from 'react';
import { Upload, Image, X, Eye, Trash2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export interface Document {
  id?: string;
  url: string;
}

interface EditTutorProfileDocumentsProps {
  documents: Document[];
  selectedDocuments: File[];
  uploading: boolean;
  onDocumentSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDocumentUpload: () => void;
  onDeleteDocument: (documentId: string) => void;
  onRemoveSelectedDocument: (index: number) => void;
}

const EditTutorProfileDocuments: React.FC<EditTutorProfileDocumentsProps> = ({
  documents,
  selectedDocuments,
  uploading,
  onDocumentSelect,
  onDocumentUpload,
  onDeleteDocument,
  onRemoveSelectedDocument
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
        <Upload className="w-5 h-5 mr-2 text-primary-600" />
        Verification Images
      </h2>
      
      {/* Selected Documents Preview */}
      {selectedDocuments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Images ({selectedDocuments.length}/5)</h3>
          <div className="space-y-2">
            {selectedDocuments.map((file, index) => (
              <div key={`selected-doc-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Image className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / (1024 * 1024)).toFixed(2)}MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveSelectedDocument(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={onDocumentUpload}
            disabled={uploading}
            className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 mr-2">
                  <LoadingSpinner size="small" />
                </div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Images
              </>
            )}
          </button>
        </div>
      )}

      {/* Document Upload Area */}
      <div>
        <div className="block text-sm font-medium text-yellow-700 mb-2">
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Tip: Upload photos of your identity, qualification and certification for Earn <span className="font-bold text-primary-600">VERIFIED</span> Badge
          </span>
        </div>
        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors duration-200 ${
          (documents.length + selectedDocuments.length) >= 5 
            ? 'border-gray-200 bg-gray-50' 
            : 'border-gray-300 hover:border-primary-500'
        }`}>
          <div className="space-y-2 text-center">
            <Image className={`mx-auto h-12 w-12 ${
              (documents.length + selectedDocuments.length) >= 5 
                ? 'text-gray-300' 
                : 'text-gray-400'
            }`} />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="document-upload"
                className={`relative rounded-md font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 ${
                  (documents.length + selectedDocuments.length) >= 5 
                    ? 'cursor-not-allowed text-gray-400 bg-gray-100 px-2 py-1' 
                    : 'cursor-pointer bg-white text-primary-600 hover:text-primary-500'
                }`}
                onClick={(e) => {
                  if ((documents.length + selectedDocuments.length) >= 5) {
                    e.preventDefault();
                    // Could add a toast here if needed
                  }
                }}
              >
                <span>
                  {(documents.length + selectedDocuments.length) >= 5 
                    ? 'Maximum reached' 
                    : 'Select images'
                  }
                </span>
                <input
                  id="document-upload"
                  type="file"
                  className="sr-only"
                  onChange={onDocumentSelect}
                  multiple
                  accept=".jpg,.jpeg,.png"
                  disabled={uploading || (documents.length + selectedDocuments.length) >= 5}
                />
              </label>
              {(documents.length + selectedDocuments.length) < 5 && (
                <p className="pl-1">or drag and drop</p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              JPG, PNG up to 2MB each ({documents.length + selectedDocuments.length}/5 images)
              {(documents.length + selectedDocuments.length) >= 5 && (
                <span className="block text-orange-600 mt-1">Maximum limit reached</span>
              )}
            </p>
          </div>
        </div>
      </div>



      {/* Existing Documents */}
      {documents && documents.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-green-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Uploaded Images ({documents.length})
          </h3>
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div key={doc.id || doc.url || `doc-${index}`} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <Image className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Image {index + 1}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => window.open(doc.url, '_blank')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {doc.id && (
                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EditTutorProfileDocuments);