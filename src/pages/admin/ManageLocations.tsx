import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAdmin, Location } from '../../contexts/AdminContext';
import { toast } from 'react-hot-toast';

const ManageLocations = () => {
  const {
    locations,
    loading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
    getAvailableParents
  } = useAdmin();

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    parentId: '',
    selectedCityId: '',
  });

  // Reset form when editing location changes
  useEffect(() => {
    if (editingLocation) {
      setFormData({
        name: editingLocation.name,
        level: editingLocation.level,
        parentId: editingLocation.parent || '',
        selectedCityId: '',
      });
    } else {
      setFormData({
        name: '',
        level: 1,
        parentId: '',
        selectedCityId: '',
      });
    }
  }, [editingLocation]);

  const handleLevelChange = (newLevel: number) => {
    setFormData(prev => ({
      ...prev,
      level: newLevel,
      parentId: '',
      selectedCityId: '',
    }));
  };

  // Get towns for selected city
  const getTownsForCity = (cityId: string): Location[] => {
    const city = locations.find(loc => loc._id === cityId);
    return city?.children || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.name.trim()) {
        toast.error('Location name is required');
        return;
      }

      // Validate parent selection based on level
      if (formData.level === 2 && !formData.parentId) {
        toast.error('Please select a City as parent for Level 1 Town');
        return;
      }
      if (formData.level === 3 && !formData.parentId) {
        toast.error('Please select a Level 1 Town as parent for Home Town');
        return;
      }

      const locationData = {
        name: formData.name.trim(),
        level: formData.level,
        parent: formData.parentId || null,
        isActive: true
      };

      if (editingLocation) {
        await updateLocation(editingLocation._id, locationData);
        toast.success('Location updated successfully');
      } else {
        await createLocation(locationData);
        toast.success('Location created successfully');
      }
      
      // Reset form
      setFormData({ name: '', level: 1, parentId: '', selectedCityId: '' });
      setEditingLocation(null);
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      toast.error(err.response?.data?.message || 'Error saving location');
    }
  };

  const handleDelete = async (locationId: string) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    
    try {
      await deleteLocation(locationId);
      toast.success('Location deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting location');
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      level: location.level,
      parentId: location.parent || '',
      selectedCityId: '',
    });
  };

  const toggleNode = (locationId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'City';
      case 2:
        return 'Town';
      case 3:
        return 'Home Town';
      default:
        return 'Unknown';
    }
  };

  const getParentLabel = (level: number) => {
    switch (level) {
      case 2:
        return 'Select City';
      case 3:
        return 'Select Town';
      default:
        return 'Select Parent';
    }
  };

  const renderLocationTree = (locations: Location[], level = 0) => {
    if (!Array.isArray(locations)) {
      console.error('Invalid locations data:', locations);
      return null;
    }

    return locations.map(location => {
      if (!location || typeof location !== 'object') {
        console.error('Invalid location object:', location);
        return null;
      }

      return (
        <div key={location._id} style={{ marginLeft: `${level * 20}px` }}>
          <div className="flex items-center py-2 hover:bg-gray-50">
            {location.children && location.children.length > 0 && (
              <button
                onClick={() => toggleNode(location._id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {expandedNodes.has(location._id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            <span className="flex-1 ml-2">
              {location.name} ({getLevelLabel(location.level)})
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(location)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(location._id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {expandedNodes.has(location._id) && location.children && (
            <div>{renderLocationTree(location.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Locations</h1>
      
      {/* Add/Edit Location Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingLocation ? 'Edit Location' : 'Add New Location'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Location Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700">
              Level
            </label>
            <select
              id="level"
              value={formData.level}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value={1}>City</option>
              <option value={2}>Town</option>
              <option value={3}>Home Town</option>
            </select>
          </div>
          
          {formData.level === 2 && (
            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                Select City
              </label>
              <select
                id="parentId"
                value={formData.parentId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option value="">Select City</option>
                {getAvailableParents(formData.level).map(loc => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.level === 3 && (
            <>
              <div>
                <label htmlFor="selectedCityId" className="block text-sm font-medium text-gray-700">
                  Select City
                </label>
                <select
                  id="selectedCityId"
                  value={formData.selectedCityId}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    selectedCityId: e.target.value,
                    parentId: ''
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="">Select City</option>
                  {getAvailableParents(2).map(loc => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.selectedCityId && (
                <div>
                  <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                    Select Town
                  </label>
                  <select
                    id="parentId"
                    value={formData.parentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Town</option>
                    {getTownsForCity(formData.selectedCityId).map(loc => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-end space-x-3">
            {editingLocation && (
              <button
                type="button"
                onClick={() => {
                  setEditingLocation(null);
                  setFormData({ name: '', level: 1, parentId: '', selectedCityId: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              {editingLocation ? 'Update Location' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>

      {/* Location Tree */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Location Hierarchy</h2>
          {loading ? (
            <div className="text-center py-4">Loading locations...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-600">{error}</div>
          ) : !Array.isArray(locations) || locations.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No locations found</div>
          ) : (
            <div className="space-y-1">{renderLocationTree(locations)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageLocations;