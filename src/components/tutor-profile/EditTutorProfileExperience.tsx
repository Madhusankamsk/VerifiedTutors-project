import React from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface EditTutorProfileExperienceProps {
  experience: Experience[];
  onExperienceChange: (experience: Experience[]) => void;
}

const EditTutorProfileExperience: React.FC<EditTutorProfileExperienceProps> = ({
  experience,
  onExperienceChange
}) => {
  const addExperience = () => {
    onExperienceChange([
      ...experience,
      { title: '', company: '', duration: '', description: '' }
    ]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperience = experience.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onExperienceChange(newExperience);
  };

  const removeExperience = (index: number) => {
    const newExperience = experience.filter((_, i) => i !== index);
    onExperienceChange(newExperience);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center text-gray-900">
          <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
          Experience
        </h2>
        <button
          type="button"
          onClick={addExperience}
          className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Experience
        </button>
      </div>
      <div className="space-y-4">
        {experience.map((exp, index) => (
          <div key={`experience-${index}`} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 2020 - 2023"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Describe your role and responsibilities..."
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="ml-4 p-2 text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditTutorProfileExperience; 