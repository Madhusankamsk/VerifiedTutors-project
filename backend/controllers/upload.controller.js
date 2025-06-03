import { cloudinary } from '../config/cloudinary.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Upload profile photo
// @route   POST /api/upload/profile-photo
// @access  Private
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  res.status(200).json({
    success: true,
    data: {
      url: req.file.path,
      publicId: req.file.filename
    }
  });
});

// @desc    Upload verification documents
// @route   POST /api/upload/verification-docs
// @access  Private
export const uploadVerificationDocs = asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('No files uploaded');
    }

    const results = req.files.map(file => ({
      id: file.filename,
      url: file.path
    }));

    res.status(200).json({
      success: true,
      data: results,
      message: 'Documents uploaded successfully'
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to upload documents'
    });
  }
});

// @desc    Delete uploaded image
// @route   DELETE /api/upload/:id
// @access  Private
export const deleteImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await cloudinary.uploader.destroy(id);

  res.status(200).json({
    success: true,
    message: 'Document deleted successfully'
  });
}); 