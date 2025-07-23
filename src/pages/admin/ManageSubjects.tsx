import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2, XCircle, BookOpen, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SubjectFormData {
  name: string;
  description: string;
}

interface Topic {
  _id: string;
  name: string;
  description: string;
  subject: string;
  isActive: boolean;
}

const initialFormData: SubjectFormData = {
  name: '',
  description: ''
};

const ManageSubjects = () => {
  const { subjects, loading, error, createSubject, updateSubject, deleteSubject, toggleSubjectStatus } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>(initialFormData);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectTopicCounts, setSubjectTopicCounts] = useState<{ [subjectId: string]: number }>({});

  // Fetch topic counts for all subjects
  const fetchTopicCounts = async () => {
    try {
      const counts: { [subjectId: string]: number } = {};
      
      for (const subject of subjects) {
        const response = await fetch(`/api/topics/subject/${subject._id}`);
        if (response.ok) {
          const topics = await response.json();
          counts[subject._id] = topics.filter((topic: Topic) => topic.isActive).length;
        } else {
          counts[subject._id] = 0;
        }
      }
      
      setSubjectTopicCounts(counts);
    } catch (error) {
      console.error('Error fetching topic counts:', error);
    }
  };

  // Fetch topic counts when subjects change
  useEffect(() => {
    if (subjects.length > 0) {
      fetchTopicCounts();
    }
  }, [subjects]);

  const handleOpenModal = (subjectId?: string) => {
    if (subjectId) {
      const subject = subjects.find(s => s._id === subjectId);
      if (subject) {
        setFormData({
          name: subject.name,
          description: subject.description
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
      // Refresh topic counts after creating/updating subject
      setTimeout(() => fetchTopicCounts(), 500);
    } catch (error) {
      toast.error('Failed to save subject');
    }
  };

  const handleDelete = async (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject? This will also delete all associated topics.')) {
      try {
        await deleteSubject(subjectId);
        toast.success('Subject deleted successfully');
        // Refresh topic counts after deleting subject
        setTimeout(() => fetchTopicCounts(), 500);
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

  const handleManageTopics = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    // Refresh topic counts when returning from topic management
    fetchTopicCounts();
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

  // If a subject is selected, show the topics management view
  if (selectedSubject) {
    const subject = subjects.find(s => s._id === selectedSubject);
    if (!subject) {
      setSelectedSubject(null);
      return null;
    }

    return (
      <ManageTopics 
        subject={subject} 
        onBack={handleBackToSubjects}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Subjects</h1>
          <p className="text-gray-600 mt-1">Create and manage subjects, then add topics for each subject</p>
        </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topics Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map((subject) => (
                <tr key={subject._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                      {subject.description && (
                        <div className="text-sm text-gray-500">{subject.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {subjectTopicCounts[subject._id] || 0} topics
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subject.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subject.isActive ? (
                        <>
                          <CheckCircle2 size={12} className="mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle size={12} className="mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleManageTopics(subject._id)}
                        className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                      >
                        <BookOpen size={16} />
                        Manage Topics
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(subject._id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(subject._id)}
                        className={`${
                          subject.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {subject.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(subject._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Modal */}
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
                  placeholder="Describe what this subject covers..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
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

// Topics Management Component
interface ManageTopicsProps {
  subject: any;
  onBack: () => void;
}

const ManageTopics: React.FC<ManageTopicsProps> = ({ subject, onBack }) => {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Fetch topics for this subject
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/topics/subject/${subject._id}`);
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      } else {
        toast.error('Failed to fetch topics');
      }
    } catch (error) {
      toast.error('Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  // Create or update topic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTopic 
        ? `/api/topics/${editingTopic}`
        : `/api/topics`;
      
      const method = editingTopic ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          subject: subject._id
        })
      });

      if (response.ok) {
        toast.success(editingTopic ? 'Topic updated successfully' : 'Topic created successfully');
        handleCloseModal();
        fetchTopics();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save topic');
      }
    } catch (error) {
      toast.error('Failed to save topic');
    }
  };

  // Delete topic
  const handleDelete = async (topicId: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        const response = await fetch(`/api/topics/${topicId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          toast.success('Topic deleted successfully');
          fetchTopics();
        } else {
          toast.error('Failed to delete topic');
        }
      } catch (error) {
        toast.error('Failed to delete topic');
      }
    }
  };

  // Toggle topic status
  const handleToggleStatus = async (topicId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      if (response.ok) {
        toast.success('Topic status updated successfully');
        fetchTopics();
      } else {
        toast.error('Failed to update topic status');
      }
    } catch (error) {
      toast.error('Failed to update topic status');
    }
  };

  const handleOpenModal = (topic?: any) => {
    if (topic) {
      setFormData({
        name: topic.name,
        description: topic.description
      });
      setEditingTopic(topic._id);
    } else {
      setFormData({ name: '', description: '' });
      setEditingTopic(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTopic(null);
    setFormData({ name: '', description: '' });
  };

  // Load topics on component mount
  React.useEffect(() => {
    fetchTopics();
  }, [subject._id]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ChevronRight size={20} className="rotate-180" />
          Back to Subjects
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Topics</h1>
          <p className="text-gray-600 mt-1">Subject: {subject.name}</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="ml-auto bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Topic
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {topics.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating the first topic for this subject.</p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create First Topic
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topics.map((topic) => (
                    <tr key={topic._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {topic.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          topic.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {topic.isActive ? (
                            <>
                              <CheckCircle2 size={12} className="mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(topic)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(topic._id, topic.isActive)}
                            className={`${
                              topic.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {topic.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(topic._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {editingTopic ? 'Edit Topic' : 'Add New Topic'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  placeholder="Enter topic name..."
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
                  placeholder="Describe what this topic covers..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {editingTopic ? 'Update' : 'Create'}
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