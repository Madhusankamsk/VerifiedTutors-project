import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  type: 'profile' | 'verification' | 'blog';
  multiple?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  type,
  multiple = false,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    const formData = new FormData();

    if (multiple) {
      Array.from(files).forEach(file => {
        formData.append('documents', file);
      });
    } else {
      formData.append('photo', files[0]);
    }

    try {
      const response = await axios.post(
        `/api/upload/${type === 'profile' ? 'profile-photo' : 'verification-docs'}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );

      if (multiple) {
        response.data.data.forEach((item: any) => {
          onUploadSuccess(item.url);
        });
      } else {
        onUploadSuccess(response.data.data.url);
      }
      
      toast.success('Upload successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        onChange={handleUpload}
        multiple={multiple}
        accept="image/*"
        className="hidden"
        id={`file-upload-${type}`}
        disabled={isUploading}
      />
      <label
        htmlFor={`file-upload-${type}`}
        className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
          isUploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload Image'}
      </label>
    </div>
  );
};

export default ImageUpload; 