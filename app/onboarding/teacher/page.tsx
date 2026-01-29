'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Loader2, Check, Building2, School } from 'lucide-react';

interface Faculty {
  id: string;
  name: string;
  shortName: string;
  dean: string;
  departments: Department[];
}

interface Department {
  id: string;
  name: string;
  head: string;
}

const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Senior Lecturer',
  'Teaching Assistant',
  'Research Assistant',
  'Visiting Faculty',
];

const EXPERIENCE_RANGES = [
  '0-2 years',
  '3-5 years',
  '6-10 years',
  '11-15 years',
  '16-20 years',
  '20+ years',
];

const STEPS = [
  { id: 1, title: 'Welcome', description: 'Getting started with your profile' },
  { id: 2, title: 'Academic Role', description: 'Tell us about your position' },
  { id: 3, title: 'Faculty', description: 'Select your faculty' },
  { id: 4, title: 'Department', description: 'Select your department' },
  { id: 5, title: 'Specialization', description: 'Your area of expertise' },
  { id: 6, title: 'Experience', description: 'Your teaching experience' },
  { id: 7, title: 'Review', description: 'Review and complete' },
];

export default function TeacherOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    designation: '',
    facultyId: '',
    departmentId: '',
    specialization: '',
    experienceYears: '',
    qualifications: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get departments for selected faculty
  const selectedFaculty = faculties.find(f => f.id === formData.facultyId);
  const availableDepartments = selectedFaculty?.departments || [];

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/faculties-list');
      if (response.ok) {
        const data = await response.json();
        setFaculties(data.faculties);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 2:
        if (!formData.designation) {
          newErrors.designation = 'Please select your designation';
        }
        break;
      case 3:
        if (!formData.facultyId) {
          newErrors.facultyId = 'Please select your faculty';
        }
        break;
      case 4:
        if (!formData.departmentId) {
          newErrors.departmentId = 'Please select your department';
        }
        break;
      case 5:
        if (!formData.specialization.trim()) {
          newErrors.specialization = 'Please enter your specialization';
        }
        break;
      case 6:
        if (!formData.experienceYears) {
          newErrors.experienceYears = 'Please select your experience level';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length && validateStep(currentStep)) {
      // Reset department when faculty changes
      if (currentStep === 3) {
        setFormData(prev => ({ ...prev, departmentId: '' }));
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setSubmitting(true);
      setErrors({});

      const response = await fetch('/api/onboarding/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.error || 'Failed to complete onboarding' });
        return;
      }

      // Redirect to pending approval page
      router.push('/pending-approval');
      router.refresh();
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Faculty Onboarding
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Let&apos;s set up your faculty profile. This will only take a few minutes.
              We&apos;ll guide you through each step.
            </p>
          </div>
        );

      case 2:
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Academic Role</h2>
            <p className="text-gray-600 mb-6">Select your current designation</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DESIGNATIONS.map((designation) => (
                <button
                  key={designation}
                  onClick={() => setFormData({ ...formData, designation })}
                  className={`p-4 text-left border-2 rounded-lg transition-all ${
                    formData.designation === designation
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">{designation}</span>
                </button>
              ))}
            </div>

            {errors.designation && (
              <p className="text-red-600 text-sm mt-2">{errors.designation}</p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <Building2 className="inline-block w-6 h-6 mr-2 mb-1" />
              Which Faculty are you in?
            </h2>
            <p className="text-gray-600 mb-6">Select the faculty where you teach or conduct research</p>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
              </div>
            ) : (
              <div className="space-y-3">
                {faculties.map((faculty) => (
                  <button
                    key={faculty.id}
                    onClick={() => setFormData({ ...formData, facultyId: faculty.id })}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      formData.facultyId === faculty.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{faculty.name}</h3>
                        <p className="text-sm text-gray-600">
                          Dean: {faculty.dean} • {faculty.departments.length} Departments
                        </p>
                      </div>
                      {formData.facultyId === faculty.id && (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.facultyId && (
              <p className="text-red-600 text-sm mt-2">{errors.facultyId}</p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <School className="inline-block w-6 h-6 mr-2 mb-1" />
              Which Department are you in?
            </h2>
            <p className="text-gray-600 mb-6">
              Select the department within {selectedFaculty?.name}
            </p>

            {availableDepartments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Please select a faculty first
              </div>
            ) : (
              <div className="space-y-3">
                {availableDepartments.map((department) => (
                  <button
                    key={department.id}
                    onClick={() => setFormData({ ...formData, departmentId: department.id })}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      formData.departmentId === department.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{department.name}</h3>
                        <p className="text-sm text-gray-600">Head: {department.head}</p>
                      </div>
                      {formData.departmentId === department.id && (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.departmentId && (
              <p className="text-red-600 text-sm mt-2">{errors.departmentId}</p>
            )}
          </div>
        );

      case 5:
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Specialization</h2>
            <p className="text-gray-600 mb-6">What is your area of expertise?</p>

            <textarea
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-0"
              placeholder="e.g., Machine Learning, Artificial Intelligence, Data Science..."
            />

            {errors.specialization && (
              <p className="text-red-600 text-sm mt-2">{errors.specialization}</p>
            )}
          </div>
        );

      case 6:
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Teaching Experience</h2>
            <p className="text-gray-600 mb-6">How many years of teaching experience do you have?</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EXPERIENCE_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setFormData({ ...formData, experienceYears: range })}
                  className={`p-4 text-center border-2 rounded-lg transition-all ${
                    formData.experienceYears === range
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">{range}</span>
                </button>
              ))}
            </div>

            {errors.experienceYears && (
              <p className="text-red-600 text-sm mt-2">{errors.experienceYears}</p>
            )}
          </div>
        );

      case 7:
        const selectedFacultyName = faculties.find(f => f.id === formData.facultyId)?.name;
        const selectedDepartmentName = availableDepartments.find(d => d.id === formData.departmentId)?.name;

        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Information</h2>
            <p className="text-gray-600 mb-6">Please review your details before submitting</p>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600">Designation</label>
                <p className="font-medium text-gray-900">{formData.designation}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Faculty</label>
                <p className="font-medium text-gray-900">{selectedFacultyName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Department</label>
                <p className="font-medium text-gray-900">{selectedDepartmentName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Specialization</label>
                <p className="font-medium text-gray-900">{formData.specialization}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Experience</label>
                <p className="font-medium text-gray-900">{formData.experienceYears}</p>
              </div>
            </div>

            {errors.submit && (
              <p className="text-red-600 text-sm mt-4">{errors.submit}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : currentStep === step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Complete Onboarding'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
