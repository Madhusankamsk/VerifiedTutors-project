import express from 'express';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../controllers/location.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getLocations);
router.post('/', protect, authorize('admin'), createLocation);
router.put('/:id', protect, authorize('admin'), updateLocation);
router.delete('/:id', protect, authorize('admin'), deleteLocation);

export default router; 