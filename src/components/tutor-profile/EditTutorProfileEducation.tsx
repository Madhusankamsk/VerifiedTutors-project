import React from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

interface EditTutorProfileEducationProps {
  education: Education[];
  onEducationChange: (education: Education[]) => void;
}

const EditTutorProfileEducation: React.FC<EditTutorProfileEducationProps> = ({
  education,
  onEducationChange
}) => {
  const addEducation = () => {
    onEducationChange([
      ...education,
      { degree: '', institution: '', year: new Date().getFullYear() }
    ]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    const newEducation = education.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onEducationChange(newEducation);
  };

  const removeEducation = (index: number) => {
    const newEducation = education.filter((_, i) => i !== index);
    onEducationChange(newEducation);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center text-gray-900">
          <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
          Education
        </h2>
        <button
          type="button"
          onClick={addEducation}
          className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Education
        </button>
      </div>
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={`education-${index}`} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                    min={1900}
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeEducation(index)}
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

export default React.memo(EditTutorProfileEducation);