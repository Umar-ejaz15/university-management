'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  User,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Briefcase,
  Users,
  Trash2,
  Eye,
  Loader2,
  Plus,
  Pencil,
  X,
  Save,
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  faculty: { id: string; name: string };
}

interface Publication {
  id?: string;
  title: string;
  year: number;
  journal: string;
  authors?: string;
  doi?: string;
  abstract?: string;
  pdfUrl?: string;
  impactFactor?: string;
  indexedIn?: string;
  citationCount?: number;
}

interface Project {
  id?: string;
  title: string;
  description: string;
  status: 'ONGOING' | 'COMPLETED' | 'PENDING';
  startDate: string;
  endDate: string;
  studentCount?: number;
}

interface Course {
  id?: string;
  name: string;
  credits: number;
  students: number;
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

const EXPERIENCE_OPTIONS = [
  '0-2 years',
  '3-5 years',
  '6-10 years',
  '11-15 years',
  '16-20 years',
  '20+ years',
];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'publications' | 'projects' | 'courses' | 'administrative' | 'students'>('profile');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [form, setForm] = useState({
    designation: '',
    departmentId: '',
    specialization: '',
    experienceYears: '',
    qualifications: '',
    bio: '',
    profileImage: '',
    studentsSupervised: 0,
    administrativeDuties: '',
  });

  // Detailed supervised students list
  const [studentsDetails, setStudentsDetails] = useState<Array<{ name: string; email?: string; departmentId?: string }>>([]);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', departmentId: '' });

  // Publications state
  const [publications, setPublications] = useState<Publication[]>([]);
  const [newPublication, setNewPublication] = useState<Publication>({
    title: '',
    year: new Date().getFullYear(),
    journal: '',
  });
  const [editingPublication, setEditingPublication] = useState<string | null>(null);
  const [editPublicationData, setEditPublicationData] = useState<Publication | null>(null);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    description: '',
    status: 'ONGOING',
    startDate: '',
    endDate: '',
    studentCount: 0,
  });
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editProjectData, setEditProjectData] = useState<Project | null>(null);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState<Course>({
    name: '',
    credits: 3,
    students: 0,
  });
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editCourseData, setEditCourseData] = useState<Course | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [profileRes, deptRes] = await Promise.all([
        fetch('/api/teacher/profile'),
        fetch('/api/departments'),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        const s = data.staff;
        setForm({
          designation: s.designation || '',
          departmentId: s.departmentId || '',
          specialization: s.specialization || '',
          experienceYears: s.experienceYears || '',
          qualifications: s.qualifications || '',
          bio: s.bio || '',
          profileImage: s.profileImage || '',
          studentsSupervised: s.studentsSupervised || 0,
          administrativeDuties: s.administrativeDuties || '',
        });
        setStudentsDetails(s.studentsSupervisedDetails || []);
        setPublications(s.publications || []);
        setProjects(s.projects || []);
        setCourses(s.courses || []);
      }

      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data.departments);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Normalize administrative duties to one bullet per line starting with '- '
      const duties = (form.administrativeDuties || '')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((l) => l.replace(/^[-*•]\s*/, '').trim())
        .map((l) => `- ${l}`)
        .join('\n');

      const payload = { ...form, administrativeDuties: duties, studentsSupervisedDetails: studentsDetails, studentsSupervised: (studentsDetails?.length || form.studentsSupervised) };

      const res = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save profile');
        return;
      }

      setSuccess('Profile saved successfully!');
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // Publication handlers
  const handleAddPublication = async () => {
    if (!newPublication.title.trim()) {
      setError('Publication title is required');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/teacher/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPublication),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add publication');
        return;
      }

      const data = await res.json();
      setPublications([...publications, data.publication]);
      setNewPublication({ title: '', year: new Date().getFullYear(), journal: '' });
      setSuccess('Publication added!');
    } catch (err) {
      setError('Failed to add publication');
    } finally {
      setSaving(false);
    }
  };

  const handleEditPublication = (pub: Publication) => {
    setEditingPublication(pub.id || null);
    setEditPublicationData({ ...pub });
  };

  const handleSavePublication = async () => {
    if (!editPublicationData || !editingPublication) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/publications/${editingPublication}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPublicationData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update publication');
        return;
      }

      const data = await res.json();
      setPublications(publications.map((p) => (p.id === editingPublication ? data.publication : p)));
      setEditingPublication(null);
      setEditPublicationData(null);
      setSuccess('Publication updated!');
    } catch (err) {
      setError('Failed to update publication');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePublication = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/publications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPublications(publications.filter((p) => p.id !== id));
        setSuccess('Publication deleted');
      }
    } catch (err) {
      setError('Failed to delete publication');
    }
  };

  // Project handlers
  const handleAddProject = async () => {
    if (!newProject.title.trim()) {
      setError('Project title is required');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/teacher/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add project');
        return;
      }

      const data = await res.json();
      setProjects([...projects, data.project]);
      setNewProject({ title: '', description: '', status: 'ONGOING', startDate: '', endDate: '' });
      setSuccess('Project added!');
    } catch (err) {
      setError('Failed to add project');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project.id || null);
    setEditProjectData({
      ...project,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      studentCount: project.studentCount || 0,
    });
  };

  const handleSaveProject = async () => {
    if (!editProjectData || !editingProject) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/projects/${editingProject}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProjectData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update project');
        return;
      }

      const data = await res.json();
      setProjects(projects.map((p) => (p.id === editingProject ? data.project : p)));
      setEditingProject(null);
      setEditProjectData(null);
      setSuccess('Project updated!');
    } catch (err) {
      setError('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
        setSuccess('Project deleted');
      }
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  // Course handlers
  const handleAddCourse = async () => {
    if (!newCourse.name.trim()) {
      setError('Course name is required');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/teacher/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add course');
        return;
      }

      const data = await res.json();
      setCourses([...courses, data.course]);
      setNewCourse({ name: '', credits: 3, students: 0 });
      setSuccess('Course added!');
    } catch (err) {
      setError('Failed to add course');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course.id || null);
    setEditCourseData({ ...course });
  };

  const handleSaveCourse = async () => {
    if (!editCourseData || !editingCourse) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/courses/${editingCourse}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCourseData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update course');
        return;
      }

      const data = await res.json();
      setCourses(courses.map((c) => (c.id === editingCourse ? data.course : c)));
      setEditingCourse(null);
      setEditCourseData(null);
      setSuccess('Course updated!');
    } catch (err) {
      setError('Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCourses(courses.filter((c) => c.id !== id));
        setSuccess('Course deleted');
      }
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f0ed]">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-[#2d6a4f] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0ed]">
      <Header />

      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">Edit Your Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your academic information, publications, projects, and courses
              </p>
            </div>
            <button
              onClick={() => router.push('/faculty')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Profile
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'profile', label: 'Profile Information', Icon: User },
                { id: 'publications', label: `Publications (${publications.length})`, Icon: BookOpen },
                { id: 'projects', label: `Projects (${projects.length})`, Icon: FlaskConical },
                { id: 'courses', label: `Courses (${courses.length})`, Icon: GraduationCap },
                { id: 'administrative', label: 'Administrative Duties', Icon: Briefcase },
                { id: 'students', label: `Students (${studentsDetails.length})`, Icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'profile' | 'publications' | 'projects' | 'courses' | 'administrative' | 'students')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-[#2d6a4f] text-[#2d6a4f]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Designation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DESIGNATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update('designation', d)}
                        className={`p-3 border-2 rounded-lg text-sm transition-all ${
                          form.designation === d
                            ? 'border-[#2d6a4f] bg-[#2d6a4f]/5 text-[#2d6a4f]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => update('departmentId', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.faculty.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization / Research Focus
                  </label>
                  <textarea
                    value={form.specialization}
                    onChange={(e) => update('specialization', e.target.value)}
                    placeholder="e.g., Machine Learning, Organic Chemistry, Educational Psychology..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {EXPERIENCE_OPTIONS.map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => update('experienceYears', exp)}
                        className={`p-3 border-2 rounded-lg text-sm transition-all ${
                          form.experienceYears === exp
                            ? 'border-[#2d6a4f] bg-[#2d6a4f]/5 text-[#2d6a4f]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Qualifications & Students */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualifications
                    </label>
                    <input
                      type="text"
                      value={form.qualifications}
                      onChange={(e) => update('qualifications', e.target.value)}
                      placeholder="e.g., PhD Computer Science, MSc Data Science"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Students Supervised
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={form.studentsSupervised}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        update('studentsSupervised', parseInt(val) || 0);
                      }}
                      placeholder="e.g., 25"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Bio
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => update('bio', e.target.value)}
                    placeholder="Tell us about yourself, your research interests, and achievements..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                

                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    value={form.profileImage}
                    onChange={(e) => update('profileImage', e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                  />
                  {form.profileImage && (
                    <div className="mt-3">
                      <img
                        src={form.profileImage}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-[#2d6a4f]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-3 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}

            {/* Publications Tab */}
            {activeTab === 'publications' && (
              <div className="space-y-6">
                {/* Add New Publication */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Add New Publication</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Publication Title"
                        value={newPublication.title}
                        onChange={(e) =>
                          setNewPublication({ ...newPublication, title: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Year (e.g., 2023)"
                        value={newPublication.year}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setNewPublication({ ...newPublication, year: parseInt(val) || new Date().getFullYear() });
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <input
                      type="text"
                      placeholder="Journal/Conference Name (optional)"
                      value={newPublication.journal}
                      onChange={(e) =>
                        setNewPublication({ ...newPublication, journal: e.target.value })
                      }
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                    />
                    <button
                      onClick={handleAddPublication}
                      disabled={saving}
                      className="px-6 py-3 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Publications List */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">
                    Your Publications ({publications.length})
                  </h3>
                  {publications.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No publications added yet. Add your first publication above.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {publications.map((pub) => (
                        <div
                          key={pub.id}
                          className="p-4 bg-white border border-gray-200 rounded-lg"
                        >
                          {editingPublication === pub.id && editPublicationData ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editPublicationData.title}
                                onChange={(e) =>
                                  setEditPublicationData({ ...editPublicationData, title: e.target.value })
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Title"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={editPublicationData.year}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setEditPublicationData({ ...editPublicationData, year: parseInt(val) || new Date().getFullYear() });
                                  }}
                                  className="p-2 border border-gray-300 rounded-lg"
                                  placeholder="Year (e.g., 2023)"
                                />
                                <input
                                  type="text"
                                  value={editPublicationData.journal || ''}
                                  onChange={(e) =>
                                    setEditPublicationData({ ...editPublicationData, journal: e.target.value })
                                  }
                                  className="p-2 border border-gray-300 rounded-lg"
                                  placeholder="Journal"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingPublication(null);
                                    setEditPublicationData(null);
                                  }}
                                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSavePublication}
                                  disabled={saving}
                                  className="px-3 py-2 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] flex items-center gap-1"
                                >
                                  <Save className="w-4 h-4" />
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{pub.title}</h4>
                                <p className="text-sm text-gray-500">
                                  {pub.year} {pub.journal && `• ${pub.journal}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditPublication(pub)}
                                  className="text-[#2d6a4f] hover:text-[#245a42] p-2"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => pub.id && handleDeletePublication(pub.id)}
                                  className="text-red-500 hover:text-red-700 p-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                {/* Add New Project */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Add New Project</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Project Title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <select
                        value={newProject.status}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            status: e.target.value as 'ONGOING' | 'COMPLETED' | 'PENDING',
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                      >
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <textarea
                      placeholder="Project Description (optional)"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({ ...newProject, description: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Student Count (e.g., 5)"
                        value={newProject.studentCount || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setNewProject({ ...newProject, studentCount: parseInt(val) || 0 });
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={newProject.startDate}
                        onChange={(e) =>
                          setNewProject({ ...newProject, startDate: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        value={newProject.endDate}
                        onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddProject}
                        disabled={saving}
                        className="w-full px-6 py-3 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Project
                      </button>
                    </div>
                  </div>
                </div>

                {/* Projects List */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">
                    Your Projects ({projects.length})
                  </h3>
                  {projects.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No projects added yet. Add your first project above.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="p-4 bg-white border border-gray-200 rounded-lg"
                        >
                          {editingProject === project.id && editProjectData ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={editProjectData.title}
                                  onChange={(e) =>
                                    setEditProjectData({ ...editProjectData, title: e.target.value })
                                  }
                                  className="p-2 border border-gray-300 rounded-lg"
                                  placeholder="Title"
                                />
                                <select
                                  value={editProjectData.status}
                                  onChange={(e) =>
                                    setEditProjectData({
                                      ...editProjectData,
                                      status: e.target.value as 'ONGOING' | 'COMPLETED' | 'PENDING',
                                    })
                                  }
                                  className="p-2 border border-gray-300 rounded-lg"
                                >
                                  <option value="ONGOING">Ongoing</option>
                                  <option value="COMPLETED">Completed</option>
                                  <option value="PENDING">Pending</option>
                                </select>
                              </div>
                              <textarea
                                value={editProjectData.description || ''}
                                onChange={(e) =>
                                  setEditProjectData({ ...editProjectData, description: e.target.value })
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                                rows={2}
                                placeholder="Description"
                              />
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={editProjectData.studentCount || ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setEditProjectData({ ...editProjectData, studentCount: parseInt(val) || 0 });
                                  }}
                                  className="p-2 border border-gray-300 rounded-lg"
                                  placeholder="Student Count (e.g., 5)"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="date"
                                  value={editProjectData.startDate || ''}
                                  onChange={(e) =>
                                    setEditProjectData({ ...editProjectData, startDate: e.target.value })
                                  }
                                  className="p-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                  type="date"
                                  value={editProjectData.endDate || ''}
                                  onChange={(e) =>
                                    setEditProjectData({ ...editProjectData, endDate: e.target.value })
                                  }
                                  className="p-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProject(null);
                                    setEditProjectData(null);
                                  }}
                                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveProject}
                                  disabled={saving}
                                  className="px-3 py-2 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] flex items-center gap-1"
                                >
                                  <Save className="w-4 h-4" />
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium text-gray-900">{project.title}</h4>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      project.status === 'COMPLETED'
                                        ? 'bg-green-100 text-green-700'
                                        : project.status === 'ONGOING'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {project.status}
                                  </span>
                                </div>
                                {project.description && (
                                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                                )}
                                {(project.startDate || project.endDate || project.studentCount) && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {project.startDate && new Date(project.startDate).toLocaleDateString()}
                                    {project.startDate && project.endDate && ' - '}
                                    {project.endDate && new Date(project.endDate).toLocaleDateString()}
                                    {project.studentCount !== undefined && (
                                      <span className="ml-3">• Students: <strong>{project.studentCount}</strong></span>
                                    )}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditProject(project)}
                                  className="text-[#2d6a4f] hover:text-[#245a42] p-2"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => project.id && handleDeleteProject(project.id)}
                                  className="text-red-500 hover:text-red-700 p-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                {/* Add New Course */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Add New Course</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Course Name"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Credits (e.g., 3)"
                        value={newCourse.credits}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setNewCourse({ ...newCourse, credits: parseInt(val) || 0 });
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Students (e.g., 45)"
                        value={newCourse.students}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setNewCourse({ ...newCourse, students: parseInt(val) || 0 });
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleAddCourse}
                      disabled={saving}
                      className="px-6 py-3 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Course
                    </button>
                  </div>
                </div>

                {/* Courses List */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">
                    Teaching Load ({courses.length} courses)
                  </h3>
                  {courses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No courses added yet. Add your first course above.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              Course
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                              Credits
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                              Students
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {courses.map((course) => (
                            <tr key={course.id} className="hover:bg-gray-50">
                              {editingCourse === course.id && editCourseData ? (
                                <>
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      value={editCourseData.name}
                                      onChange={(e) =>
                                        setEditCourseData({ ...editCourseData, name: e.target.value })
                                      }
                                      className="w-full p-2 border border-gray-300 rounded"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={editCourseData.credits}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setEditCourseData({
                                          ...editCourseData,
                                          credits: parseInt(val) || 0,
                                        });
                                      }}
                                      className="w-20 p-2 border border-gray-300 rounded text-center mx-auto block"
                                      placeholder="3"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={editCourseData.students}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setEditCourseData({
                                          ...editCourseData,
                                          students: parseInt(val) || 0,
                                        });
                                      }}
                                      className="w-20 p-2 border border-gray-300 rounded text-center mx-auto block"
                                      placeholder="45"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingCourse(null);
                                          setEditCourseData(null);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 p-1"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={handleSaveCourse}
                                        disabled={saving}
                                        className="text-[#2d6a4f] hover:text-[#245a42] p-1"
                                      >
                                        <Save className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-3 text-gray-900">{course.name}</td>
                                  <td className="px-4 py-3 text-center text-gray-600">
                                    {course.credits}
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-600">
                                    {course.students}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => handleEditCourse(course)}
                                        className="text-[#2d6a4f] hover:text-[#245a42] p-1"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => course.id && handleDeleteCourse(course.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Administrative Tab */}
        {activeTab === 'administrative' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Administrative Duties</h3>
            <p className="text-sm text-gray-500 mb-3">Enter one duty per line. We&apos;ll normalize to bullets on save.</p>
            <textarea
              value={form.administrativeDuties}
              onChange={(e) => update('administrativeDuties', e.target.value)}
              placeholder="- Head of Research Committee\n- Department Coordinator"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent resize-none font-mono text-sm"
              rows={6}
            />
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] transition-colors disabled:opacity-50 font-medium"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Students Supervised</h3>
            <p className="text-sm text-gray-500 mb-3">Add individual student entries with optional department.</p>

            <div className="space-y-3 mb-4">
              {studentsDetails.length === 0 ? (
                <p className="text-gray-500">No students added yet.</p>
              ) : (
                studentsDetails.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-sm text-gray-500">{s.email}{s.departmentId ? ` • Dept: ${departments.find(d=>d.id===s.departmentId)?.name || s.departmentId}` : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStudentsDetails(studentsDetails.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                placeholder="Student Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="p-2 border border-gray-300 rounded"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="p-2 border border-gray-300 rounded"
              />
              <select
                value={newStudent.departmentId}
                onChange={(e) => setNewStudent({ ...newStudent, departmentId: e.target.value })}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="">Select department (optional)</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!newStudent.name.trim()) return setError('Student name is required');
                  setStudentsDetails([...studentsDetails, { ...newStudent }]);
                  setNewStudent({ name: '', email: '', departmentId: '' });
                  setError('');
                }}
                className="px-4 py-2 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42]"
              >Add Student</button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >Save</button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          © {new Date().getFullYear()} MNSUAM — Faculty Dashboard
        </div>
      </main>
    </div>
  );
}
