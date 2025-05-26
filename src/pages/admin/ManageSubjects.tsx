import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { SUBJECT_CATEGORIES, EDUCATION_LEVELS, MEDIUM_OPTIONS } from '../../contexts/AdminContext';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SubjectFormData {
  name: string;
  category: string;
  description: string;
  medium: typeof MEDIUM_OPTIONS[number];
  educationLevel: keyof typeof EDUCATION_LEVELS;
}

const initialFormData: SubjectFormData = {
  name: '',
  category: SUBJECT_CATEGORIES.PRIMARY[0],
  description: '',
  medium: 'English',
  educationLevel: 'PRIMARY'
};

const ManageSubjects = () => {
  const { subjects, loading, error, createSubject, updateSubject, deleteSubject, toggleSubjectStatus } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>(initialFormData);
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<keyof typeof EDUCATION_LEVELS>('PRIMARY');

  const handleOpenModal = (subjectId?: string) => {
    if (subjectId) {
      const subject = subjects.find(s => s._id === subjectId);
      if (subject) {
        setFormData({
          name: subject.name,
          category: subject.category,
          description: subject.description,
          medium: subject.medium,
          educationLevel: subject.educationLevel
        });
        setSelectedEducationLevel(subject.educationLevel);
        setEditingSubject(subjectId);
      }
    } else {
      setFormData(initialFormData);
      setSelectedEducationLevel('PRIMARY');
      setEditingSubject(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData(initialFormData);
    setSelectedEducationLevel('PRIMARY');
  };

  const handleEducationLevelChange = (level: keyof typeof EDUCATION_LEVELS) => {
    setSelectedEducationLevel(level);
    setFormData(prev => ({
      ...prev,
      educationLevel: level,
      category: level === 'ADVANCED_LEVEL' 
        ? SUBJECT_CATEGORIES.ADVANCED_LEVEL.ARTS[0] 
        : level === 'HIGHER_EDUCATION'
          ? 'Computer Science' // Default category for higher education
          : (SUBJECT_CATEGORIES[level as keyof typeof SUBJECT_CATEGORIES] as string[])[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await updateSubject(editingSubject, formData);
        toast.success('Subject updated successfully');
      } else {
        await createSubject({ ...formData, isActive: true });
        toast.success('Subject created successfully');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save subject');
    }
  };

  const handleDelete = async (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(subjectId);
        toast.success('Subject deleted successfully');
      } catch (error) {
        toast.error('Failed to delete subject');
      }
    }
  };

  const handleToggleStatus = async (subjectId: string) => {
    try {
      await toggleSubjectStatus(subjectId);
      toast.success('Subject status updated');
    } catch (error) {
      toast.error('Failed to update subject status');
    }
  };

  const getAvailableCategories = () => {
    if (selectedEducationLevel === 'ADVANCED_LEVEL') {
      return [
        ...SUBJECT_CATEGORIES.ADVANCED_LEVEL.ARTS,
        ...SUBJECT_CATEGORIES.ADVANCED_LEVEL.COMMERCE,
        ...SUBJECT_CATEGORIES.ADVANCED_LEVEL.SCIENCE
      ];
    }
    if (selectedEducationLevel === 'HIGHER_EDUCATION') {
      return ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law', 'Arts & Humanities'];
    }
    return SUBJECT_CATEGORIES[selectedEducationLevel as keyof typeof SUBJECT_CATEGORIES] as string[];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Subjects</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Subject
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medium</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map((subject) => (
                <tr key={subject._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                    <div className="text-sm text-gray-500">{subject.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {subject.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {EDUCATION_LEVELS[subject.educationLevel]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.medium}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(subject._id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        subject.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {subject.isActive ? (
                        <>
                          <CheckCircle2 size={14} />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(subject._id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(subject._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Education Level</label>
                  <select
                    value={selectedEducationLevel}
                    onChange={(e) => handleEducationLevelChange(e.target.value as keyof typeof EDUCATION_LEVELS)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {Object.entries(EDUCATION_LEVELS).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {getAvailableCategories().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medium</label>
                  <select
                    value={formData.medium}
                    onChange={(e) => setFormData({ ...formData, medium: e.target.value as typeof MEDIUM_OPTIONS[number] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    {MEDIUM_OPTIONS.map((medium) => (
                      <option key={medium} value={medium}>
                        {medium}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    {editingSubject ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;