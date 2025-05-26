import Location from '../models/location.model.js';

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new location
// @route   POST /api/locations
// @access  Private/Admin
export const createLocation = async (req, res) => {
  const { name, province } = req.body;
  try {
    const location = await Location.create({ name, province });
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a location
// @route   PUT /api/locations/:id
// @access  Private/Admin
export const updateLocation = async (req, res) => {
  const { id } = req.params;
  const { name, province, isActive } = req.body;
  try {
    const location = await Location.findByIdAndUpdate(id, { name, province, isActive }, { new: true });
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
export const deleteLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const location = await Location.findByIdAndDelete(id);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json({ message: 'Location deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 