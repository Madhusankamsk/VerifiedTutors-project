import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SubjectFormData {
  name: string;
  description: string;
  topics: string[];
}

const initialFormData: SubjectFormData = {
  name: '',
  description: '',
  topics: []
};

const ManageSubjects = () => {
  const { subjects, loading, error, createSubject, updateSubject, deleteSubject, toggleSubjectStatus } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>(initialFormData);
  const [newTopic, setNewTopic] = useState('');

  const handleOpenModal = (subjectId?: string) => {
    if (subjectId) {
      const subject = subjects.find(s => s._id === subjectId);
      if (subject) {
        setFormData({
          name: subject.name,
          description: subject.description,
          topics: subject.topics || []
        });
        setEditingSubject(subjectId);
      }
    } else {
      setFormData(initialFormData);
      setEditingSubject(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData(initialFormData);
    setNewTopic('');
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !formData.topics.includes(newTopic.trim())) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
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
      toast.success('Subject status updated successfully');
    } catch (error) {
      toast.error('Failed to update subject status');
    }
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map((subject) => (
                <tr key={subject._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                      {subject.description && (
                        <div className="text-sm text-gray-500">{subject.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {subject.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(subject._id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subject.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {subject.isActive ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(subject._id)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject._id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topics
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Add a topic"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(topic)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;