'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Loader2,
  Check,
  Building2,
  School,
  GraduationCap,
  BookOpen,
  Microscope,
  Clock,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

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

const STEP_ICONS = [
  <User key={1} className="w-7 h-7" />,
  <GraduationCap key={2} className="w-7 h-7" />,
  <Building2 key={3} className="w-7 h-7" />,
  <School key={4} className="w-7 h-7" />,
  <Microscope key={5} className="w-7 h-7" />,
  <Clock key={6} className="w-7 h-7" />,
  <ClipboardList key={7} className="w-7 h-7" />,
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
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-[#2d6a4f]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-[#2d6a4f]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome to Faculty Onboarding
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
              Let&apos;s set up your faculty profile. This will only take a few minutes.
              We&apos;ll guide you through each step.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { label: '7 Steps', sub: 'Quick setup' },
                { label: '5 mins', sub: 'To complete' },
                { label: '100%', sub: 'Secure' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-base font-bold text-[#2d6a4f]">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Academic Role</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">Select your current designation</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DESIGNATIONS.map((designation) => (
                <button
                  key={designation}
                  onClick={() => setFormData({ ...formData, designation })}
                  className={`p-3.5 text-left border-2 rounded-xl transition-all ${
                    formData.designation === designation
                      ? 'border-[#2d6a4f] bg-[#2d6a4f]/5'
                      : 'border-gray-200 hover:border-[#2d6a4f]/40 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 text-sm">{designation}</span>
                    {formData.designation === designation && (
                      <div className="w-5 h-5 rounded-full bg-[#2d6a4f] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {errors.designation && (
              <div className="flex items-center gap-2 mt-3 text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{errors.designation}</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Which Faculty are you in?</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Select the faculty where you teach or conduct research
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#2d6a4f]" />
              </div>
            ) : (
              <div className="space-y-2.5">
                {faculties.map((faculty) => (
                  <button
                    key={faculty.id}
                    onClick={() => setFormData({ ...formData, facultyId: faculty.id })}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                      formData.facultyId === faculty.id
                        ? 'border-[#2d6a4f] bg-[#2d6a4f]/5'
                        : 'border-gray-200 hover:border-[#2d6a4f]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{faculty.name}</h3>
                        <p className="text-xs text-gray-500">
                          Dean: {faculty.dean} &bull; {faculty.departments.length} Departments
                        </p>
                      </div>
                      {formData.facultyId === faculty.id && (
                        <div className="w-5 h-5 rounded-full bg-[#2d6a4f] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.facultyId && (
              <div className="flex items-center gap-2 mt-3 text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{errors.facultyId}</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                <School className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Which Department are you in?</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Select the department within {selectedFaculty?.name}
            </p>

            {availableDepartments.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <School className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Please select a faculty first</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {availableDepartments.map((department) => (
                  <button
                    key={department.id}
                    onClick={() => setFormData({ ...formData, departmentId: department.id })}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                      formData.departmentId === department.id
                        ? 'border-[#2d6a4f] bg-[#2d6a4f]/5'
                        : 'border-gray-200 hover:border-[#2d6a4f]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{department.name}</h3>
                        <p className="text-xs text-gray-500">Head: {department.head}</p>
                      </div>
                      {formData.departmentId === department.id && (
                        <div className="w-5 h-5 rounded-full bg-[#2d6a4f] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.departmentId && (
              <div className="flex items-center gap-2 mt-3 text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{errors.departmentId}</p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                <Microscope className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Specialization</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">What is your area of expertise?</p>

            <textarea
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 outline-none transition-all text-gray-800 placeholder:text-gray-400 text-sm resize-none"
              placeholder="e.g., Machine Learning, Artificial Intelligence, Data Science..."
            />

            {errors.specialization && (
              <div className="flex items-center gap-2 mt-3 text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{errors.specialization}</p>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Teaching Experience</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              How many years of teaching experience do you have?
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {EXPERIENCE_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setFormData({ ...formData, experienceYears: range })}
                  className={`p-4 text-center border-2 rounded-xl transition-all ${
                    formData.experienceYears === range
                      ? 'border-[#2d6a4f] bg-[#2d6a4f]/5'
                      : 'border-gray-200 hover:border-[#2d6a4f]/40 bg-white'
                  }`}
                >
                  <span className="font-semibold text-gray-900 text-sm">{range}</span>
                </button>
              ))}
            </div>

            {errors.experienceYears && (
              <div className="flex items-center gap-2 mt-3 text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{errors.experienceYears}</p>
              </div>
            )}
          </div>
        );

      case 7: {
        const selectedFacultyName = faculties.find(f => f.id === formData.facultyId)?.name;
        const selectedDepartmentName = availableDepartments.find(d => d.id === formData.departmentId)?.name;

        return (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Review Your Information</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Please review your details before submitting
            </p>

            <div className="bg-gray-50 rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {[
                { label: 'Designation', value: formData.designation },
                { label: 'Faculty', value: selectedFacultyName },
                { label: 'Department', value: selectedDepartmentName },
                { label: 'Specialization', value: formData.specialization },
                { label: 'Experience', value: formData.experienceYears },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-4 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 shrink-0 pt-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-gray-900 flex-1">{value || '—'}</p>
                </div>
              ))}
            </div>

            {errors.submit && (
              <div className="flex items-center gap-2 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{errors.submit}</p>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Top branding */}
        <div className="text-center mb-8">
          <p className="text-[#c9a961] text-xs font-semibold uppercase tracking-widest mb-1">
            MNSUAM Portal
          </p>
          <h1 className="text-white text-xl font-bold">Faculty Profile Setup</h1>
        </div>

        {/* Progress bar */}
        <div className="mb-6 px-2">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step dot */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                      currentStep > step.id
                        ? 'bg-[#c9a961] border-[#c9a961] text-white'
                        : currentStep === step.id
                        ? 'bg-white border-white text-[#2d6a4f]'
                        : 'bg-white/10 border-white/20 text-white/40'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      step.id
                    )}
                  </div>
                </div>
                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 transition-all ${
                      currentStep > step.id ? 'bg-[#c9a961]' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step label */}
          <div className="text-center">
            <p className="text-white/70 text-xs">
              Step {currentStep} of {STEPS.length}
              <span className="text-white font-semibold ml-2">
                {STEPS[currentStep - 1].title}
              </span>
              <span className="text-white/50 ml-1">
                — {STEPS[currentStep - 1].description}
              </span>
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-white/10">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5 gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-3 border border-white/30 text-white rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-white/40 text-xs hidden sm:block">
            {currentStep} / {STEPS.length}
          </span>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#c9a961] hover:bg-[#b89850] text-white rounded-xl transition-all text-sm font-semibold shadow-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-[#2d6a4f] hover:bg-[#235a40] text-white rounded-xl transition-all text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Complete Onboarding
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
