import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Filter, ChevronDown, ChevronUp, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';

// Use the same Tutor interface from AdminContext
import { Tutor as AdminTutor } from '../../contexts/AdminContext';

type Tutor = AdminTutor;

interface VerificationChecklist {
  id: string;
  label: string;
  isChecked: boolean;
}

const ManageTutors = () => {
  const { 
    tutors, 
    totalPages, 
    currentPage, 
    loading, 
    error: contextError,
    fetchTutors, 
    verifyTutor, 
    rejectTutor, 
    deleteTutor 
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    verified: 'all',
    rating: 'all',
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showTutorDetails, setShowTutorDetails] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [verificationChecklist, setVerificationChecklist] = useState<VerificationChecklist[]>([
    { id: 'documents', label: 'Valid ID Documents', isChecked: false },
    { id: 'education', label: 'Education Certificates', isChecked: false },
    { id: 'experience', label: 'Experience Verification', isChecked: false },
    { id: 'background', label: 'Background Check', isChecked: false },
    { id: 'interview', label: 'Interview Completed', isChecked: false }
  ]);

  useEffect(() => {
    fetchTutors(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const handleVerify = async (tutorId: string) => {
    try {
      const allChecked = verificationChecklist.every(item => item.isChecked);
      if (!allChecked) {
        setLocalError('Please complete all verification checks before approving');
        return;
      }

      await verifyTutor(tutorId);
      
      // Reset checklist after successful verification
      setVerificationChecklist(prev =>
        prev.map(item => ({ ...item, isChecked: false }))
      );
      
      // Close the modal and refresh the tutor list
      setShowTutorDetails(false);
      fetchTutors(currentPage, searchTerm, filters);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to verify tutor';
      setLocalError(errorMessage);
      console.error('Verify tutor error:', err);
    }
  };

  const handleReject = async (tutorId: string) => {
    if (!rejectionReason.trim()) {
      setLocalError('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectTutor(tutorId, rejectionReason);
      fetchTutors(currentPage, searchTerm, filters);
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to reject tutor');
    }
  };

  const handleDelete = async (tutorId: string) => {
    if (window.confirm('Are you sure you want to delete this tutor?')) {
      try {
        await deleteTutor(tutorId);
        fetchTutors(currentPage, searchTerm, filters);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to delete tutor');
      }
    }
  };

  const handleViewDetails = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowTutorDetails(true);
  };

  const handleChecklistChange = (id: string) => {
    setVerificationChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Tutors</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tutors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
              <select
                value={filters.verified}
                onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">All</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rating</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tutors List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tutors.map((tutor) => (
                <tr key={tutor._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={tutor.user?.profileImage || 'https://via.placeholder.com/40'}
                          alt={tutor.user?.name || 'Tutor'}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tutor.user?.name || 'Unknown Tutor'}</div>
                        <div className="text-sm text-gray-500">{tutor.user?.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {tutor.subjects?.map((subject) => subject.subject?.name).join(', ') || 'No subjects'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tutor.rating?.toFixed(1) || '0.0'}</div>
                    <div className="text-sm text-gray-500">({tutor.totalRatings || 0} reviews)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tutor.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {tutor.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(tutor)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {!tutor.isVerified && (
                        <>
                          <button
                            onClick={() => handleVerify(tutor._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Verify Tutor"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTutor(tutor);
                              setShowRejectModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Tutor"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() => fetchTutors(currentPage - 1, searchTerm, filters)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => fetchTutors(currentPage + 1, searchTerm, filters)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      </div>

      {/* Tutor Details Modal */}
      {showTutorDetails && selectedTutor && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Tutor Verification</h2>
                <button
                  onClick={() => setShowTutorDetails(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Verification Checklist */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Verification Checklist</h3>
                <div className="space-y-2">
                  {verificationChecklist.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={item.isChecked}
                        onChange={() => handleChecklistChange(item.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={item.id} className="ml-2 text-sm text-gray-700">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tutor Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTutor?.user?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTutor?.user?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTutor?.gender || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mobile Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTutor?.mobileNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Education</h3>
                  <div className="mt-2 space-y-2">
                    {selectedTutor?.education?.map((edu: { degree: string; institution: string; year: number }, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-500">{edu.institution}</p>
                        <p className="text-sm text-gray-500">Year: {edu.year}</p>
                      </div>
                    )) || <p className="text-sm text-gray-500">No education information provided</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Experience</h3>
                  <div className="mt-2 space-y-2">
                    {selectedTutor?.experience?.map((exp: { position: string; institution: string; duration: string; description: string }, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-gray-900">{exp.position}</p>
                        <p className="text-sm text-gray-500">{exp.institution}</p>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                        <p className="text-sm text-gray-500">{exp.description}</p>
                      </div>
                    )) || <p className="text-sm text-gray-500">No experience information provided</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {selectedTutor?.documents?.map((doc: string, index: number) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Document {index + 1}
                      </a>
                    )) || <p className="text-sm text-gray-500">No documents provided</p>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTutorDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                {!selectedTutor.isVerified && (
                  <button
                    onClick={() => handleVerify(selectedTutor._id)}
                    className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                    disabled={!verificationChecklist.every(item => item.isChecked)}
                  >
                    Approve Tutor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedTutor && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Reject Tutor</h2>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Please provide a detailed reason for rejection..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedTutor._id)}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                >
                  Reject Tutor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {(contextError || localError) && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{contextError || localError}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTutors;