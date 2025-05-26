import Location from '../models/location.model.js';

// @desc    Get all locations in tree structure
// @route   GET /api/locations
// @access  Public
export const getLocations = async (req, res) => {
  try {
    // First get all cities
    const cities = await Location.find({ level: 1, isActive: true }).lean();
    
    // For each city, get its Level 1 towns
    const locationTree = await Promise.all(cities.map(async (city) => {
      const level1Towns = await Location.find({ 
        parent: city._id,
        level: 2,
        isActive: true 
      }).lean();

      // For each Level 1 town, get its Home towns
      const townsWithHomes = await Promise.all(level1Towns.map(async (town) => {
        const homeTowns = await Location.find({
          parent: town._id,
          level: 3,
          isActive: true
        }).lean();

        return {
          ...town,
          children: homeTowns
        };
      }));

      return {
        ...city,
        children: townsWithHomes
      };
    }));

    res.json(locationTree);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new location
// @route   POST /api/locations
// @access  Private/Admin
export const createLocation = async (req, res) => {
  const { name, level, parent } = req.body;
  
  try {
    console.log('Creating location:', { name, level, parent });

    // Basic validation
    if (!name || !level) {
      return res.status(400).json({ message: 'Name and level are required' });
    }

    // Validate level
    if (![1, 2, 3].includes(level)) {
      return res.status(400).json({ message: 'Invalid level. Must be 1 (City), 2 (Town), or 3 (Home Town)' });
    }

    let parentLocation = null;
    if (parent) {
      parentLocation = await Location.findById(parent);
      if (!parentLocation) {
        return res.status(400).json({ message: 'Parent location not found' });
      }

      // Validate parent-child relationship
      if (level === 2 && parentLocation.level !== 1) {
        return res.status(400).json({ message: 'Towns must be created under a city' });
      }
      if (level === 3 && parentLocation.level !== 2) {
        return res.status(400).json({ message: 'Home towns must be created under a town' });
      }
    } else if (level !== 1) {
      return res.status(400).json({ message: 'Only cities can be created without a parent' });
    }

    // Check for duplicate name under the same parent
    const existingLocation = await Location.findOne({
      name,
      parent: parent || null
    });

    if (existingLocation) {
      return res.status(400).json({ 
        message: `A ${level === 1 ? 'city' : level === 2 ? 'town' : 'home town'} with this name already exists under the selected parent` 
      });
    }

    const location = await Location.create({
      name,
      level,
      parent: parent || null
    });

    console.log('Created location:', location);
    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Location with this name already exists under the same parent' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// @desc    Update a location
// @route   PUT /api/locations/:id
// @access  Private/Admin
export const updateLocation = async (req, res) => {
  const { id } = req.params;
  const { name, level, parentId } = req.body;
  
  try {
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await Location.findById(parentId);
      if (!parent) {
        return res.status(400).json({ message: 'Parent location not found' });
      }

      // Validate parent-child relationship
      if (level === 2 && parent.level !== 1) {
        return res.status(400).json({ message: 'Level 1 towns must be under a city' });
      }
      if (level === 3 && parent.level !== 2) {
        return res.status(400).json({ message: 'Home towns must be under a Level 1 town' });
      }

      // Prevent circular reference
      if (parentId === id) {
        return res.status(400).json({ message: 'Location cannot be its own parent' });
      }
    } else if (level !== 1) {
      return res.status(400).json({ message: 'Only cities can exist without a parent' });
    }

    // Check for duplicate name under the same parent
    const existingLocation = await Location.findOne({
      name,
      parent: parentId || null,
      _id: { $ne: id }
    });

    if (existingLocation) {
      return res.status(400).json({ 
        message: `A ${level === 1 ? 'city' : level === 2 ? 'Level 1 town' : 'Home town'} with this name already exists under the selected parent` 
      });
    }

    location.name = name;
    location.level = level;
    location.parent = parentId || null;
    
    await location.save();
    res.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Location with this name already exists under the same parent' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// @desc    Delete a location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
export const deleteLocation = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if location has children
    const hasChildren = await Location.exists({ parent: id });
    if (hasChildren) {
      return res.status(400).json({ 
        message: 'Cannot delete location with child locations. Delete child locations first.' 
      });
    }

    const location = await Location.findByIdAndDelete(id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ message: 'Location deleted' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(400).json({ message: error.message });
  }
}; 