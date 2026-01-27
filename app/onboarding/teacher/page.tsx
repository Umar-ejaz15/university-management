'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Loader2, Check } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  faculty: {
    id: string;
    name: string;
    shortName: string;
  };
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

const STEPS = [
  { id: 1, title: 'Welcome', description: 'Getting started with your profile' },
  { id: 2, title: 'Academic Role', description: 'Tell us about your position' },
  { id: 3, title: 'Department', description: 'Select your department' },
  { id: 4, title: 'Specialization', description: 'Your area of expertise' },
  { id: 5, title: 'Experience', description: 'Your teaching experience' },
  { id: 6, title: 'Review', description: 'Review and complete' },
];

export default function TeacherOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    designation: '',
    departmentId: '',
    specialization: '',
    experienceYears: '',
    qualifications: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
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
        if (!formData.departmentId) {
          newErrors.departmentId = 'Please select your department';
        }
        break;
      case 4:
        if (!formData.specialization.trim()) {
          newErrors.specialization = 'Please enter your specialization';
        }
        break;
      case 5:
        if (!formData.experienceYears) {
          newErrors.experienceYears = 'Please select your experience level';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setSubmitting(true);
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

      // Redirect to dashboard
      router.push('/uni-dashboard');
      router.refresh();
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-[#2d6a4f] rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MNSUAM!</h2>
              <p className="text-gray-600 mb-4">
                Let's set up your faculty profile. This will only take a few minutes.
              </p>
              <p className="text-sm text-gray-500">
                We'll ask you about your academic role, department, and expertise to help you get started.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your academic role?</h2>
              <p className="text-gray-600">Select the designation that best describes your position</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DESIGNATIONS.map((designation) => (
                <button
                  key={designation}
                  onClick={() => updateFormData('designation', designation)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.designation === designation
                      ? 'border-[#2d6a4f] bg-[#2d6a4f]/5 text-[#2d6a4f]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{designation}</span>
                </button>
              ))}
            </div>
            {errors.designation && (
              <p className="text-red-600 text-sm text-center">{errors.designation}</p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Which department are you in?</h2>
              <p className="text-gray-600">Select the department where you teach or conduct research</p>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-[#2d6a4f] animate-spin mx-auto" />
                <p className="text-gray-600 mt-2">Loading departments...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => updateFormData('departmentId', dept.id)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      formData.departmentId === dept.id
                        ? 'border-[#2d6a4f] bg-[#2d6a4f]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{dept.name}</div>
                    <div className="text-sm text-gray-600">{dept.faculty.name}</div>
                  </button>
                ))}
              </div>
            )}
            {errors.departmentId && (
              <p className="text-red-600 text-sm text-center">{errors.departmentId}</p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your specialization?</h2>
              <p className="text-gray-600">Tell us about your area of expertise or research focus</p>
            </div>
            <div>
              <textarea
                value={formData.specialization}
                onChange={(e) => updateFormData('specialization', e.target.value)}
                placeholder="e.g., Machine Learning, Organic Chemistry, Educational Psychology..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent resize-none"
                rows={4}
              />
              {errors.specialization && (
                <p className="text-red-600 text-sm mt-1">{errors.specialization}</p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How many years of teaching experience do you have?</h2>
              <p className="text-gray-600">This helps us understand your expertise level</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                '0-2 years',
                '3-5 years',
                '6-10 years',
                '11-15 years',
                '16-20 years',
                '20+ years',
              ].map((experience) => (
                <button
                  key={experience}
                  onClick={() => updateFormData('experienceYears', experience)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formData.experienceYears === experience
                      ? 'border-[#2d6a4f] bg-[#2d6a4f]/5 text-[#2d6a4f]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{experience}</span>
                </button>
              ))}
            </div>
            {errors.experienceYears && (
              <p className="text-red-600 text-sm text-center">{errors.experienceYears}</p>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review your information</h2>
              <p className="text-gray-600">Please review the information below before completing your profile</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{/* We'll get this from auth */}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Designation</label>
                  <p className="text-gray-900">{formData.designation}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <p className="text-gray-900">
                    {departments.find(d => d.id === formData.departmentId)?.name}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Specialization</label>
                  <p className="text-gray-900">{formData.specialization}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Experience</label>
                  <p className="text-gray-900">{formData.experienceYears}</p>
                </div>
              </div>
            </div>
            {errors.submit && (
              <p className="text-red-600 text-sm text-center">{errors.submit}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="MNSUAM" className="w-8 h-8" />
              <span className="font-semibold text-gray-900">Faculty Onboarding</span>
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id < currentStep
                        ? 'bg-[#2d6a4f] text-white'
                        : step.id === currentStep
                        ? 'bg-[#2d6a4f] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  {step.id < STEPS.length && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step.id < currentStep ? 'bg-[#2d6a4f]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm p-8">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Completing...' : 'Complete Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}