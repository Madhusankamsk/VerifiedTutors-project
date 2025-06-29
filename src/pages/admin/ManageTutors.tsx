import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Filter, ChevronDown, ChevronUp, CheckCircle, XCircle, Eye, AlertCircle, AlertTriangle, Check, X } from 'lucide-react';

// Use the same Tutor interface from AdminContext
import { Tutor as AdminTutor } from '../../contexts/AdminContext';

type Tutor = AdminTutor;

interface VerificationRequirement {
  id: string;
  label: string;
  isChecked: boolean;
  isRequired: boolean;
  validationFn: (tutor: Tutor) => { isValid: boolean; message: string };
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
    deleteTutor,
    toggleTutorVerification
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
  const [verificationRequirements, setVerificationRequirements] = useState<VerificationRequirement[]>([
    { 
      id: 'personalInfo', 
      label: 'Personal Information', 
      isChecked: false,
      isRequired: true,
      validationFn: (tutor) => {
        const hasName = !!tutor.user?.name;
        const hasEmail = !!tutor.user?.email;
        const hasGender = !!tutor.gender;
        const hasPhone = !!tutor.mobileNumber || !!tutor.phone;
        const hasBio = !!tutor.bio;
        
        const isValid = hasName && hasEmail && hasGender && hasPhone && hasBio;
        let message = '';
        
        if (!isValid) {
          const missing = [];
          if (!hasName) missing.push('name');
          if (!hasEmail) missing.push('email');
          if (!hasGender) missing.push('gender');
          if (!hasPhone) missing.push('phone number');
          if (!hasBio) missing.push('bio');
          
          message = `Missing: ${missing.join(', ')}`;
        }
        
        return { isValid, message };
      }
    },
    { 
      id: 'education', 
      label: 'Education Certificates', 
      isChecked: false,
      isRequired: true,
      validationFn: (tutor) => {
        const hasEducation = Array.isArray(tutor.education) && tutor.education.length > 0;
        return { 
          isValid: hasEducation, 
          message: hasEducation ? `${tutor.education?.length} education records` : 'No education records provided' 
        };
      }
    },
    { 
      id: 'experience', 
      label: 'Experience Verification', 
      isChecked: false,
      isRequired: false,
      validationFn: (tutor) => {
        const hasExperience = Array.isArray(tutor.experience) && tutor.experience.length > 0;
        return { 
          isValid: hasExperience, 
          message: hasExperience ? `${tutor.experience?.length} experience records` : 'No experience records provided' 
        };
      }
    },
    { 
      id: 'documents', 
      label: 'Valid ID Documents', 
      isChecked: false,
      isRequired: true,
      validationFn: (tutor) => {
        const hasDocuments = Array.isArray(tutor.documents) && tutor.documents.length > 0;
        return { 
          isValid: hasDocuments, 
          message: hasDocuments ? `${tutor.documents?.length} documents uploaded` : 'No documents uploaded' 
        };
      }
    },
    { 
      id: 'subjects', 
      label: 'Subject Information', 
      isChecked: false,
      isRequired: true,
      validationFn: (tutor) => {
        const hasSubjects = Array.isArray(tutor.subjects) && tutor.subjects.length > 0;
        return { 
          isValid: hasSubjects, 
          message: hasSubjects ? `${tutor.subjects?.length} subjects added` : 'No subjects added' 
        };
      }
    }
  ]);

  useEffect(() => {
    fetchTutors(currentPage, searchTerm, filters);
  }, [currentPage, filters]);

  // Handle search separately to avoid auto-searching on every keystroke
  const handleSearch = () => {
    fetchTutors(1, searchTerm, filters);
  };

  // Clear search and reset to first page
  const handleClearSearch = () => {
    setSearchTerm('');
    fetchTutors(1, '', filters);
  };

  const handleVerify = async (tutorId: string) => {
    try {
      const allChecked = verificationRequirements.every(item => item.isChecked);
      if (!allChecked) {
        setLocalError('Please complete all verification checks before approving');
        return;
      }

      await verifyTutor(tutorId);
      
      // Reset checklist after successful verification
      setVerificationRequirements(prev =>
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

  const handleToggleVerification = async (tutorId: string, isVerified: boolean) => {
    const action = isVerified ? 'unverify' : 'verify';
    if (window.confirm(`Are you sure you want to ${action} this tutor?`)) {
      try {
        await toggleTutorVerification(tutorId);
        fetchTutors(currentPage, searchTerm, filters);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : `Failed to ${action} tutor`);
      }
    }
  };

  const handleViewDetails = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    
    // Evaluate each verification requirement based on the tutor data
    setVerificationRequirements(prev => 
      prev.map(req => {
        const validation = req.validationFn(tutor);
        return {
          ...req,
          // If the tutor is already verified, pre-check all items
          isChecked: tutor.isVerified ? true : req.isChecked
        };
      })
    );
    
    setShowTutorDetails(true);
  };

  const handleChecklistChange = (id: string) => {
    setVerificationRequirements(prev =>
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
        <div className="relative flex">
          <input
            type="text"
            placeholder="Search tutors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-r-md hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
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
                      {!tutor.isVerified ? (
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
                      ) : (
                        <button
                          onClick={() => handleToggleVerification(tutor._id, tutor.isVerified)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Change to Unverified"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
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
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-start justify-center overflow-y-auto overflow-x-hidden pt-10 pb-10">
          <div className="relative bg-white rounded-lg w-full max-w-4xl mx-4 my-auto shadow-xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex justify-between items-center p-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tutor Verification</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1 break-words">
                  {selectedTutor.user?.name} ({selectedTutor.user?.email})
                </p>
              </div>
              <button
                onClick={() => setShowTutorDetails(false)}
                className="text-gray-400 hover:text-gray-500 flex-shrink-0"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
              {/* Verification Status Summary */}
              <div className="mb-6 p-3 md:p-4 rounded-lg border" style={{ backgroundColor: selectedTutor.isVerified ? '#f0fdf4' : '#fef2f2', borderColor: selectedTutor.isVerified ? '#bbf7d0' : '#fecaca' }}>
                <div className="flex items-center mb-3">
                  {selectedTutor.isVerified ? (
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600 mr-2 flex-shrink-0" />
                  )}
                  <h3 className="text-base md:text-lg font-medium" style={{ color: selectedTutor.isVerified ? '#166534' : '#b91c1c' }}>
                    {selectedTutor.isVerified ? 'Verified Tutor' : 'Unverified Tutor'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-3">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Status</p>
                    <p className="text-xs md:text-sm font-medium" style={{ color: selectedTutor.isVerified ? '#166534' : '#b91c1c' }}>
                      {selectedTutor.verificationStatus || 'Unknown'}
                    </p>
                  </div>
                  {selectedTutor.verificationDate && (
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Verification Date</p>
                      <p className="text-xs md:text-sm font-medium text-gray-800">
                        {new Date(selectedTutor.verificationDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Verification Progress */}
                <div className="mt-3">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Verification Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${selectedTutor.isVerified ? 'bg-green-600' : 'bg-blue-600'}`}
                      style={{ 
                        width: `${Math.round(
                          (verificationRequirements.filter(req => 
                            req.validationFn(selectedTutor).isValid
                          ).length / 
                          verificationRequirements.filter(req => req.isRequired).length) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>
                      {verificationRequirements.filter(req => req.validationFn(selectedTutor).isValid && req.isRequired).length} 
                      of {verificationRequirements.filter(req => req.isRequired).length} requirements met
                    </span>
                    <span>
                      {Math.round(
                        (verificationRequirements.filter(req => 
                          req.validationFn(selectedTutor).isValid && req.isRequired
                        ).length / 
                        verificationRequirements.filter(req => req.isRequired).length) * 100
                      )}%
                    </span>
                  </div>
                </div>
                
                {selectedTutor.rejectionReason && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded">
                    <p className="text-xs md:text-sm font-medium text-red-800">Rejection Reason:</p>
                    <p className="text-xs md:text-sm text-red-700">{selectedTutor.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Verification Checklist */}
              <div className="mb-6 border rounded-lg p-3 md:p-4 bg-gray-50">
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3">Verification Requirements</h3>
                <div className="space-y-4">
                  {verificationRequirements.map((item) => {
                    const validation = item.validationFn(selectedTutor);
                    return (
                      <div key={item.id} className="flex flex-col">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={item.id}
                              checked={item.isChecked}
                              onChange={() => handleChecklistChange(item.id)}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={item.id} className="ml-2 text-xs md:text-sm font-medium text-gray-700 flex items-center">
                              {item.label}
                              {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                          </div>
                          <div className="flex items-center">
                            {validation.isValid ? (
                              <span className="text-green-600 flex items-center text-xs md:text-sm">
                                <Check size={16} className="mr-1 flex-shrink-0" />
                                Complete
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center text-xs md:text-sm">
                                <AlertTriangle size={16} className="mr-1 flex-shrink-0" />
                                {item.isRequired ? 'Required' : 'Optional'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-7 mt-1 text-xs text-gray-500">
                          {validation.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!verificationRequirements.every(item => item.isChecked || (!item.isRequired && !item.validationFn(selectedTutor).isValid)) && (
                  <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs md:text-sm text-yellow-700 flex items-center">
                    <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                    <span>Please review all required items before approving this tutor</span>
                  </div>
                )}
              </div>

              {/* Tutor Details */}
              <div className="space-y-4 md:space-y-6">
                {/* Personal Information Section */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 flex justify-between items-center">
                    <h3 className="font-medium text-sm md:text-base text-gray-900">Personal Information</h3>
                    {selectedTutor?.user?.name && selectedTutor?.gender && (selectedTutor?.mobileNumber || selectedTutor?.phone) ? (
                      <span className="text-green-600 text-xs md:text-sm flex items-center">
                        <Check size={16} className="mr-1 flex-shrink-0" />
                        Complete
                      </span>
                    ) : (
                      <span className="text-red-600 text-xs md:text-sm flex items-center">
                        <AlertTriangle size={16} className="mr-1 flex-shrink-0" />
                        Incomplete
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <p className="text-xs md:text-sm text-gray-500">Name</p>
                        <p className={`text-xs md:text-sm font-medium ${selectedTutor?.user?.name ? 'text-gray-900' : 'text-red-500'}`}>
                          {selectedTutor?.user?.name || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-500">Email</p>
                        <p className={`text-xs md:text-sm font-medium break-words ${selectedTutor?.user?.email ? 'text-gray-900' : 'text-red-500'}`}>
                          {selectedTutor?.user?.email || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-500">Gender</p>
                        <p className={`text-xs md:text-sm font-medium ${selectedTutor?.gender ? 'text-gray-900' : 'text-red-500'}`}>
                          {selectedTutor?.gender || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-500">Mobile Number</p>
                        <p className={`text-xs md:text-sm font-medium ${(selectedTutor?.mobileNumber || selectedTutor?.phone) ? 'text-gray-900' : 'text-red-500'}`}>
                          {selectedTutor?.mobileNumber || selectedTutor?.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    {selectedTutor?.bio ? (
                      <div className="mt-3">
                        <p className="text-xs md:text-sm text-gray-500">Bio</p>
                        <p className="text-xs md:text-sm text-gray-900 mt-1">{selectedTutor.bio}</p>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs md:text-sm text-red-500">Bio not provided</p>
                    )}
                  </div>
                </div>

                {/* Education Section */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 flex justify-between items-center">
                    <h3 className="font-medium text-sm md:text-base text-gray-900">Education</h3>
                    {selectedTutor?.education && selectedTutor.education.length > 0 ? (
                      <span className="text-green-600 text-xs md:text-sm flex items-center">
                        <Check size={16} className="mr-1 flex-shrink-0" />
                        {selectedTutor.education.length} Records
                      </span>
                    ) : (
                      <span className="text-red-600 text-xs md:text-sm flex items-center">
                        <AlertTriangle size={16} className="mr-1 flex-shrink-0" />
                        No Records
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    {selectedTutor?.education && selectedTutor.education.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTutor.education.map((edu: { degree: string; institution: string; year: number }, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <p className="text-xs md:text-sm font-medium text-gray-900">{edu.degree}</p>
                            <p className="text-xs md:text-sm text-gray-500">{edu.institution}</p>
                            <p className="text-xs md:text-sm text-gray-500">Year: {edu.year}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-red-500">No education information provided</p>
                    )}
                  </div>
                </div>

                {/* Experience Section */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 flex justify-between items-center">
                    <h3 className="font-medium text-sm md:text-base text-gray-900">Experience</h3>
                    {selectedTutor?.experience && selectedTutor.experience.length > 0 ? (
                      <span className="text-green-600 text-xs md:text-sm flex items-center">
                        <Check size={16} className="mr-1 flex-shrink-0" />
                        {selectedTutor.experience.length} Records
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-xs md:text-sm flex items-center">
                        <AlertTriangle size={16} className="mr-1 flex-shrink-0" />
                        Optional
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    {selectedTutor?.experience && selectedTutor.experience.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTutor.experience.map((exp: { position: string; institution: string; duration: string; description: string }, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <p className="text-xs md:text-sm font-medium text-gray-900">{exp.position}</p>
                            <p className="text-xs md:text-sm text-gray-500">{exp.institution}</p>
                            <p className="text-xs md:text-sm text-gray-500">{exp.duration}</p>
                            <p className="text-xs md:text-sm text-gray-500">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-gray-500">No experience information provided (optional)</p>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 flex justify-between items-center">
                    <h3 className="font-medium text-sm md:text-base text-gray-900">Verification Images</h3>
                    {selectedTutor?.documents && selectedTutor.documents.length > 0 ? (
                      <span className="text-green-600 text-xs md:text-sm flex items-center">
                        <Check size={16} className="mr-1 flex-shrink-0" />
                        {selectedTutor.documents.length} Images
                      </span>
                    ) : (
                      <span className="text-red-600 text-xs md:text-sm flex items-center">
                        <AlertTriangle size={16} className="mr-1 flex-shrink-0" />
                        No Images
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    {selectedTutor?.documents && selectedTutor.documents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {selectedTutor.documents.map((doc: { id?: string; url: string }, index: number) => (
                          <a
                            key={doc.id || index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs md:text-sm flex items-center"
                          >
                            Verification Image {index + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-red-500">No verification images provided</p>
                    )}
                  </div>
                </div>

                {/* Subjects Section */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 flex justify-between items-center">
                    <h3 className="font-medium text-sm md:text-base text-gray-900">Subjects</h3>
                    {selectedTutor?.subjects && selectedTutor.subjects.length > 0 ? (
                      <span className="text-green-600 text-xs md:text-sm flex items-center">
                        <Check size={16} className="mr-1 flex-shrink-0" />
                        {selectedTutor.subjects.length} Subjects
                      </span>
                    ) : (
                      <span className="text-red-600 text-xs md:text-sm flex items-center">
                        <AlertTriangle size={16} className="mr-1 flex-shrink-0" />
                        No Subjects
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    {selectedTutor?.subjects && selectedTutor.subjects.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTutor.subjects.map((subj, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <p className="text-xs md:text-sm font-medium text-gray-900">{subj.subject?.name}</p>
                            <p className="text-xs md:text-sm text-gray-500">Category: {subj.subject?.category}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-red-500">No subjects added</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setShowTutorDetails(false)}
                  className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                {!selectedTutor.isVerified ? (
                  <button
                    onClick={() => handleVerify(selectedTutor._id)}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-green-600 border border-transparent rounded-md text-xs md:text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    disabled={!verificationRequirements.every(item => item.isChecked || (!item.isRequired && !item.validationFn(selectedTutor).isValid))}
                  >
                    Approve Tutor
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleToggleVerification(selectedTutor._id, selectedTutor.isVerified);
                      setShowTutorDetails(false);
                    }}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-yellow-600 border border-transparent rounded-md text-xs md:text-sm font-medium text-white hover:bg-yellow-700"
                  >
                    Change to Unverified
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedTutor && (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-start justify-center overflow-y-auto overflow-x-hidden pt-10 pb-10">
          <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 my-auto shadow-xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex justify-between items-center p-4">
              <h2 className="text-lg font-bold text-gray-900">Reject Tutor</h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="mb-4">
                <label htmlFor="rejectionReason" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
                  rows={4}
                  placeholder="Please provide a detailed reason for rejection..."
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedTutor._id)}
                  disabled={!rejectionReason.trim()}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 border border-transparent rounded-md text-xs md:text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
        <div className="fixed bottom-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{contextError || localError}</span>
            <button 
              onClick={() => setLocalError(null)} 
              className="ml-3 text-red-700 hover:text-red-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTutors;