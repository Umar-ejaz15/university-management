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
  ArrowLeft,
  Calendar,
  Hash,
  AlertCircle,
  CheckCircle2,
  Upload,
  Camera,
  ShieldCheck,
  ShieldX,
  Clock,
  ImagePlus,
} from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing-client';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Department {
  id: string;
  name: string;
  faculty: { id: string; name: string };
}

type VerifStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

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
  imageUrl?: string;
  verificationStatus?: VerifStatus;
  rejectionReason?: string | null;
}

interface Project {
  id?: string;
  title: string;
  description: string;
  status: 'ONGOING' | 'COMPLETED' | 'PENDING';
  startDate: string;
  endDate: string;
  studentCount?: number;
  imageUrl?: string;
  verificationStatus?: VerifStatus;
  rejectionReason?: string | null;
}

interface Course {
  id?: string;
  name: string;
  credits: number;
  students: number;
  verificationStatus?: VerifStatus;
  rejectionReason?: string | null;
}

// ─── Verification badge ───────────────────────────────────────────────────────

function VerifBadge({ status, reason }: { status?: VerifStatus; reason?: string | null }) {
  if (!status || status === 'PENDING') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
      <Clock className="w-3 h-3" />Pending review
    </span>
  );
  if (status === 'VERIFIED') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
      <ShieldCheck className="w-3 h-3" />Verified
    </span>
  );
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold">
        <ShieldX className="w-3 h-3" />Rejected — needs update
      </span>
      {reason && (
        <div className="flex items-start gap-1.5 mt-1 px-2 py-1.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{reason}</span>
        </div>
      )}
    </div>
  );
}

// ─── Profile verification status banner ───────────────────────────────────────

function ProfileVerifBanner({ status, reason }: { status?: VerifStatus; reason?: string | null }) {
  if (!status || status === 'PENDING') return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-4">
      <Clock className="w-4 h-4 flex-shrink-0" />
      <span><strong>Profile under review.</strong> Changes are pending admin verification.</span>
    </div>
  );
  if (status === 'VERIFIED') return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 mb-4">
      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
      <span><strong>Profile verified</strong> by admin.</span>
    </div>
  );
  return (
    <div className="flex items-start gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 mb-4">
      <ShieldX className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>
        <strong>Profile rejected.</strong> Please address the feedback below and resubmit.
        {reason && <p className="mt-0.5 text-red-700">{reason}</p>}
      </div>
    </div>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'publications' | 'projects' | 'courses' | 'administrative' | 'students'
  >('profile');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile verification state
  const [profileVerifStatus, setProfileVerifStatus] = useState<VerifStatus>('PENDING');
  const [profileVerifReason, setProfileVerifReason] = useState<string | null>(null);

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
  const [studentsDetails, setStudentsDetails] = useState<
    Array<{ name: string; email?: string; departmentId?: string }>
  >([]);
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
  const [showAddPubModal, setShowAddPubModal] = useState(false);

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
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState<Course>({
    name: '',
    credits: 3,
    students: 0,
  });
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editCourseData, setEditCourseData] = useState<Course | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

  // ─── Data fetching ──────────────────────────────────────────────────────────

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
        setProfileVerifStatus(s.profileVerificationStatus || 'PENDING');
        setProfileVerifReason(s.profileRejectionReason || null);
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

  // ─── Profile save ───────────────────────────────────────────────────────────

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

      const payload = {
        ...form,
        administrativeDuties: duties,
        studentsSupervisedDetails: studentsDetails,
        studentsSupervised: studentsDetails?.length || form.studentsSupervised,
      };

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

      setProfileVerifStatus('PENDING');
      setProfileVerifReason(null);
      setSuccess('Changes submitted for admin verification.');
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // ─── Publication handlers ───────────────────────────────────────────────────

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
      setShowAddPubModal(false);
      setSuccess('Publication submitted for admin verification.');
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
      setPublications(
        publications.map((p) => (p.id === editingPublication ? data.publication : p))
      );
      setEditingPublication(null);
      setEditPublicationData(null);
      setSuccess('Publication updated — pending re-verification.');
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

  // ─── Project handlers ───────────────────────────────────────────────────────

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
      setShowAddProjectModal(false);
      setSuccess('Project submitted for admin verification.');
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
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split('T')[0]
        : '',
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().split('T')[0]
        : '',
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
      setSuccess('Project updated — pending re-verification.');
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

  // ─── Course handlers ────────────────────────────────────────────────────────

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
      setShowAddCourseModal(false);
      setSuccess('Course submitted for admin verification.');
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
      setSuccess('Course updated — pending re-verification.');
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

  // ─── Style helpers ──────────────────────────────────────────────────────────

  const inputCls =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all placeholder:text-gray-400';

  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  const projectStatusBadge = (status: string) => {
    if (status === 'ONGOING') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (status === 'COMPLETED') return 'bg-gray-100 text-gray-600 border border-gray-200';
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  };

  // ─── Loading screen ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#2d6a4f] animate-spin mx-auto" />
            <p className="mt-4 text-gray-500 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Tab config ─────────────────────────────────────────────────────────────

  const tabs = [
    { id: 'profile' as const, label: 'Personal Info', Icon: User },
    { id: 'publications' as const, label: 'Publications', count: publications.length, Icon: BookOpen },
    { id: 'projects' as const, label: 'Projects', count: projects.length, Icon: FlaskConical },
    { id: 'courses' as const, label: 'Courses', count: courses.length, Icon: GraduationCap },
    { id: 'administrative' as const, label: 'Admin Duties', Icon: Briefcase },
    { id: 'students' as const, label: 'Students', count: studentsDetails.length, Icon: Users },
  ];

  // ─── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Page Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
              <p className="text-white/60 mt-1 text-sm">
                Manage your academic information, publications, projects and courses
              </p>
            </div>
            <button
              onClick={() => router.push('/faculty')}
              className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0"
            >
              <Eye className="w-4 h-4" />
              View Profile
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Alerts ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl mb-6 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-xl mb-6 text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto shrink-0 text-emerald-400 hover:text-emerald-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <nav className="flex border-b border-gray-100 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError('');
                    setSuccess('');
                  }}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#2d6a4f] text-[#2d6a4f] bg-[#2d6a4f]/5'
                      : 'border-transparent text-gray-500 hover:text-[#2d6a4f] hover:bg-gray-50'
                  }`}
                >
                  <tab.Icon className="w-4 h-4" />
                  {tab.label}
                  {'count' in tab && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        activeTab === tab.id
                          ? 'bg-[#2d6a4f] text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              PERSONAL INFO TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="p-8 space-y-8">

              {/* Profile verification banner */}
              <ProfileVerifBanner status={profileVerifStatus} reason={profileVerifReason} />

              {/* Section: Identity */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#2d6a4f]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                </div>

                {/* Designation */}
                <div className="mb-7">
                  <label className={labelCls}>Designation</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {DESIGNATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update('designation', d)}
                        className={`p-3 border-2 rounded-xl text-sm font-medium transition-all text-left leading-tight ${
                          form.designation === d
                            ? 'border-[#2d6a4f] bg-[#2d6a4f]/8 text-[#2d6a4f]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department */}
                <div className="mb-6">
                  <label className={labelCls}>Department</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => update('departmentId', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.faculty.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qualifications + Students 2-col */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className={labelCls}>Qualifications</label>
                    <input
                      type="text"
                      value={form.qualifications}
                      onChange={(e) => update('qualifications', e.target.value)}
                      placeholder="e.g., PhD Computer Science, MSc Data Science"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Students Supervised</label>
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
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <label className={labelCls}>Years of Experience</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
                    {EXPERIENCE_OPTIONS.map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => update('experienceYears', exp)}
                        className={`p-3 border-2 rounded-xl text-sm font-medium transition-all text-center ${
                          form.experienceYears === exp
                            ? 'border-[#2d6a4f] bg-[#2d6a4f]/8 text-[#2d6a4f]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specialization */}
                <div className="mb-6">
                  <label className={labelCls}>Specialization / Research Focus</label>
                  <textarea
                    value={form.specialization}
                    onChange={(e) => update('specialization', e.target.value)}
                    placeholder="e.g., Machine Learning, Organic Chemistry, Educational Psychology..."
                    className={`${inputCls} resize-none`}
                    rows={3}
                  />
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <label className={labelCls}>Short Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => update('bio', e.target.value)}
                    placeholder="Tell us about yourself, your research interests, and achievements..."
                    className={`${inputCls} resize-none`}
                    rows={4}
                  />
                </div>

                {/* Profile Image */}
                <div className="mb-6">
                  <label className={labelCls}>Profile Photo</label>
                  <div className="flex items-start gap-6">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      {form.profileImage ? (
                        <div className="relative group">
                          <img
                            src={form.profileImage}
                            alt="Profile"
                            className="w-28 h-28 rounded-2xl object-cover border-2 border-[#2d6a4f]/40 shadow-md"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={() => update('profileImage', '')}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            title="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-[#2d6a4f]/10 border-2 border-dashed border-[#2d6a4f]/30 flex flex-col items-center justify-center">
                          <Camera className="w-8 h-8 text-[#2d6a4f]/40 mb-1" />
                          <span className="text-xs text-[#2d6a4f]/50 font-medium">No photo</span>
                        </div>
                      )}
                    </div>

                    {/* Upload area */}
                    <div className="flex-1 space-y-3">
                      <p className="text-sm text-gray-500">Upload a professional profile photo. Max 4MB, JPG/PNG/WebP.</p>
                      <div className="[&_.ut-button]:bg-[#2d6a4f] [&_.ut-button]:rounded-xl [&_.ut-button]:px-5 [&_.ut-button]:py-2.5 [&_.ut-button]:text-sm [&_.ut-button]:font-semibold [&_.ut-button]:hover:bg-[#245a42] [&_.ut-button]:transition-colors [&_.ut-button]:shadow-sm [&_.ut-label]:text-gray-500 [&_.ut-label]:text-xs">
                        <UploadButton
                          endpoint="profileImage"
                          onClientUploadComplete={(res) => {
                            if (res?.[0]?.ufsUrl) {
                              update('profileImage', res[0].ufsUrl);
                            }
                          }}
                          onUploadError={(error) => {
                            setError(`Upload failed: ${error.message}`);
                          }}
                          appearance={{
                            button: 'bg-[#2d6a4f] hover:bg-[#245a42] rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm ut-uploading:cursor-not-allowed ut-uploading:opacity-70',
                            allowedContent: 'text-gray-400 text-xs mt-1',
                          }}
                          content={{
                            button({ ready }) {
                              return ready ? (
                                <span className="flex items-center gap-2"><Upload className="w-4 h-4" />Upload Photo</span>
                              ) : 'Getting ready…';
                            },
                          }}
                        />
                      </div>
                      {/* Fallback URL input */}
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Or paste an image URL directly:</p>
                        <input
                          type="url"
                          value={form.profileImage}
                          onChange={(e) => update('profileImage', e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-7 py-3 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PUBLICATIONS TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'publications' && (
            <div className="p-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#2d6a4f]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Publications</h2>
                    <p className="text-xs text-gray-400">{publications.length} total</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNewPublication({ title: '', year: new Date().getFullYear(), journal: '' });
                    setShowAddPubModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#c9a961] text-[#1a3d2b] rounded-xl text-sm font-bold hover:bg-[#b8963a] transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Publication
                </button>
              </div>

              {/* Publications table / list */}
              {publications.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No publications yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click &ldquo;Add Publication&rdquo; to get started.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Year</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Journal / Conference</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell w-28">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {publications.map((pub, idx) => (
                        <tr key={pub.id} className="hover:bg-gray-50 transition-colors">
                          {editingPublication === pub.id && editPublicationData ? (
                            <>
                              <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={editPublicationData.title}
                                  onChange={(e) =>
                                    setEditPublicationData({
                                      ...editPublicationData,
                                      title: e.target.value,
                                    })
                                  }
                                  className={inputCls}
                                  placeholder="Title"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={editPublicationData.year}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setEditPublicationData({
                                      ...editPublicationData,
                                      year: parseInt(val) || new Date().getFullYear(),
                                    });
                                  }}
                                  className="w-20 px-3 py-2.5 border border-gray-200 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all"
                                  placeholder="Year"
                                />
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <input
                                  type="text"
                                  value={editPublicationData.journal || ''}
                                  onChange={(e) =>
                                    setEditPublicationData({
                                      ...editPublicationData,
                                      journal: e.target.value,
                                    })
                                  }
                                  className={inputCls}
                                  placeholder="Journal"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingPublication(null);
                                      setEditPublicationData(null);
                                    }}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleSavePublication}
                                    disabled={saving}
                                    className="p-2 rounded-lg text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors disabled:opacity-50"
                                    title="Save"
                                  >
                                    {saving ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Save className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3">
                                <span className="w-7 h-7 rounded-lg bg-[#2d6a4f] text-white text-xs font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-start gap-2 mb-1">
                                  {pub.imageUrl && (
                                    <img src={pub.imageUrl} alt={pub.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                                  )}
                                  <div>
                                    <p className="font-semibold text-gray-900 leading-snug line-clamp-2">
                                      {pub.title}
                                    </p>
                                    {pub.doi && (
                                      <p className="text-xs text-gray-400 mt-0.5 font-mono">DOI: {pub.doi}</p>
                                    )}
                                  </div>
                                </div>
                                <VerifBadge status={pub.verificationStatus} reason={pub.rejectionReason} />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700">
                                  {pub.year}
                                </span>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <p className="text-gray-600 text-xs line-clamp-1 italic">
                                  {pub.journal || <span className="text-gray-300 not-italic">—</span>}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleEditPublication(pub)}
                                    className="p-2 rounded-lg text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => pub.id && handleDeletePublication(pub.id)}
                                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                    title="Delete"
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
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PROJECTS TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'projects' && (
            <div className="p-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-[#2d6a4f]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Research Projects</h2>
                    <p className="text-xs text-gray-400">{projects.length} total</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNewProject({
                      title: '',
                      description: '',
                      status: 'ONGOING',
                      startDate: '',
                      endDate: '',
                      studentCount: 0,
                    });
                    setShowAddProjectModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#c9a961] text-[#1a3d2b] rounded-xl text-sm font-bold hover:bg-[#b8963a] transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Project
                </button>
              </div>

              {/* Projects cards grid */}
              {projects.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No projects yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click &ldquo;Add Project&rdquo; to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#2d6a4f]/20 hover:shadow-sm transition-all"
                    >
                      {editingProject === project.id && editProjectData ? (
                        /* ── inline edit form ── */
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={editProjectData.title}
                              onChange={(e) =>
                                setEditProjectData({ ...editProjectData, title: e.target.value })
                              }
                              className={inputCls}
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
                              className={inputCls}
                            >
                              <option value="ONGOING">Ongoing</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="PENDING">Pending</option>
                            </select>
                          </div>
                          <textarea
                            value={editProjectData.description || ''}
                            onChange={(e) =>
                              setEditProjectData({
                                ...editProjectData,
                                description: e.target.value,
                              })
                            }
                            className={`${inputCls} resize-none`}
                            rows={2}
                            placeholder="Description"
                          />
                          <div className="grid grid-cols-3 gap-3">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={editProjectData.studentCount || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setEditProjectData({
                                  ...editProjectData,
                                  studentCount: parseInt(val) || 0,
                                });
                              }}
                              className={inputCls}
                              placeholder="Students"
                            />
                            <input
                              type="date"
                              value={editProjectData.startDate || ''}
                              onChange={(e) =>
                                setEditProjectData({
                                  ...editProjectData,
                                  startDate: e.target.value,
                                })
                              }
                              className={inputCls}
                            />
                            <input
                              type="date"
                              value={editProjectData.endDate || ''}
                              onChange={(e) =>
                                setEditProjectData({
                                  ...editProjectData,
                                  endDate: e.target.value,
                                })
                              }
                              className={inputCls}
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => {
                                setEditingProject(null);
                                setEditProjectData(null);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                              <X className="w-4 h-4" /> Cancel
                            </button>
                            <button
                              onClick={handleSaveProject}
                              disabled={saving}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#235a40] transition-colors disabled:opacity-50 font-semibold"
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── display view ── */
                        <>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h4 className="font-bold text-gray-900 text-sm leading-snug">
                              {project.title}
                            </h4>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${projectStatusBadge(
                                project.status
                              )}`}
                            >
                              {project.status}
                            </span>
                          </div>
                          {project.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                              {project.description}
                            </p>
                          )}
                          <VerifBadge status={project.verificationStatus} reason={project.rejectionReason} />
                          <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                            {(project.startDate || project.endDate) && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {project.startDate &&
                                  new Date(project.startDate).toLocaleDateString()}
                                {project.startDate && project.endDate && ' – '}
                                {project.endDate &&
                                  new Date(project.endDate).toLocaleDateString()}
                              </span>
                            )}
                            {project.studentCount !== undefined && project.studentCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {project.studentCount} students
                              </span>
                            )}
                          </div>
                          <div className="flex justify-end gap-1 pt-3 border-t border-gray-50">
                            <button
                              onClick={() => handleEditProject(project)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => project.id && handleDeleteProject(project.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              COURSES TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'courses' && (
            <div className="p-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-[#2d6a4f]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Courses</h2>
                    <p className="text-xs text-gray-400">{courses.length} in teaching load</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNewCourse({ name: '', credits: 3, students: 0 });
                    setShowAddCourseModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#c9a961] text-[#1a3d2b] rounded-xl text-sm font-bold hover:bg-[#b8963a] transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
              </div>

              {/* Courses table */}
              {courses.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No courses yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click &ldquo;Add Course&rdquo; to get started.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Course Name
                        </th>
                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">
                          Credits
                        </th>
                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                          Students Enrolled
                        </th>
                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-32 hidden lg:table-cell">
                          Status
                        </th>
                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                          {editingCourse === course.id && editCourseData ? (
                            <>
                              <td className="px-5 py-3">
                                <input
                                  type="text"
                                  value={editCourseData.name}
                                  onChange={(e) =>
                                    setEditCourseData({ ...editCourseData, name: e.target.value })
                                  }
                                  className={inputCls}
                                />
                              </td>
                              <td className="px-5 py-3">
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
                                  className="w-20 px-3 py-2.5 border border-gray-200 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all mx-auto block"
                                  placeholder="3"
                                />
                              </td>
                              <td className="px-5 py-3">
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
                                  className="w-20 px-3 py-2.5 border border-gray-200 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all mx-auto block"
                                  placeholder="45"
                                />
                              </td>
                              <td className="px-5 py-3 hidden lg:table-cell" />
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingCourse(null);
                                      setEditCourseData(null);
                                    }}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleSaveCourse}
                                    disabled={saving}
                                    className="p-2 rounded-lg text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors disabled:opacity-50"
                                    title="Save"
                                  >
                                    {saving ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Save className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-4 font-semibold text-gray-900">
                                {course.name}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-[#2d6a4f]/10 text-[#2d6a4f]">
                                  <Hash className="w-3 h-3" />
                                  {course.credits}
                                </span>
                              </td>
                              <td className="px-5 py-4 hidden lg:table-cell">
                                <VerifBadge status={course.verificationStatus} reason={course.rejectionReason} />
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-orange-50 text-orange-700">
                                  <Users className="w-3 h-3" />
                                  {course.students}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleEditCourse(course)}
                                    className="p-2 rounded-lg text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => course.id && handleDeleteCourse(course.id)}
                                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                    title="Delete"
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
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            ADMINISTRATIVE DUTIES TAB  (outside the tabbed white card)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'administrative' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <ProfileVerifBanner status={profileVerifStatus} reason={profileVerifReason} />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Administrative Duties</h2>
                <p className="text-xs text-gray-400">
                  Enter one duty per line. We&apos;ll normalize to bullets on save.
                </p>
              </div>
            </div>
            <textarea
              value={form.administrativeDuties}
              onChange={(e) => update('administrativeDuties', e.target.value)}
              placeholder={'- Head of Research Committee\n- Department Coordinator'}
              className={`${inputCls} resize-none font-mono`}
              rows={8}
            />
            <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-7 py-3 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STUDENTS TAB  (outside the tabbed white card)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <ProfileVerifBanner status={profileVerifStatus} reason={profileVerifReason} />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Students Supervised</h2>
                  <p className="text-xs text-gray-400">
                    Add individual student entries with optional department.
                  </p>
                </div>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-bold bg-blue-50 text-blue-600">
                {studentsDetails.length} students
              </span>
            </div>

            {/* Students list */}
            <div className="space-y-2 mb-7">
              {studentsDetails.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No students added yet.</p>
                </div>
              ) : (
                studentsDetails.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#2d6a4f]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#2d6a4f] font-bold text-sm">
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {s.email}
                        {s.departmentId
                          ? ` · ${
                              departments.find((d) => d.id === s.departmentId)?.name ||
                              s.departmentId
                            }`
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setStudentsDetails(studentsDetails.filter((_, i) => i !== idx))
                      }
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add student row */}
            <div className="bg-[#f4fbf7] border border-[#2d6a4f]/15 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[#2d6a4f] mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Student
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Student Name *"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className={inputCls}
                />
                <select
                  value={newStudent.departmentId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, departmentId: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">Select department (optional)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Student
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs py-4">
          © {new Date().getFullYear()} MNSUAM — Faculty Dashboard
        </div>
      </main>

      {/* ════════════════════════════════════════════════════════════════════════
          ADD PUBLICATION MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {showAddPubModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Add Publication</h2>
              </div>
              <button
                onClick={() => setShowAddPubModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  type="text"
                  placeholder="Publication title"
                  value={newPublication.title}
                  onChange={(e) => setNewPublication({ ...newPublication, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Year *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={String(new Date().getFullYear())}
                    value={newPublication.year}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewPublication({
                        ...newPublication,
                        year: parseInt(val) || new Date().getFullYear(),
                      });
                    }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Journal / Conference</label>
                  <input
                    type="text"
                    placeholder="e.g., Nature, IEEE CVPR"
                    value={newPublication.journal}
                    onChange={(e) =>
                      setNewPublication({ ...newPublication, journal: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Authors</label>
                  <input
                    type="text"
                    placeholder="Author names"
                    value={newPublication.authors || ''}
                    onChange={(e) =>
                      setNewPublication({ ...newPublication, authors: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>DOI</label>
                  <input
                    type="text"
                    placeholder="10.xxxx/xxxxx"
                    value={newPublication.doi || ''}
                    onChange={(e) =>
                      setNewPublication({ ...newPublication, doi: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Impact Factor</label>
                  <input
                    type="text"
                    placeholder="e.g., 4.5"
                    value={newPublication.impactFactor || ''}
                    onChange={(e) =>
                      setNewPublication({ ...newPublication, impactFactor: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Citation Count</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g., 12"
                    value={newPublication.citationCount || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewPublication({
                        ...newPublication,
                        citationCount: parseInt(val) || 0,
                      });
                    }}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Indexed In</label>
                <input
                  type="text"
                  placeholder="e.g., Scopus, Web of Science"
                  value={newPublication.indexedIn || ''}
                  onChange={(e) =>
                    setNewPublication({ ...newPublication, indexedIn: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Abstract</label>
                <textarea
                  placeholder="Brief abstract (optional)"
                  value={newPublication.abstract || ''}
                  onChange={(e) =>
                    setNewPublication({ ...newPublication, abstract: e.target.value })
                  }
                  className={`${inputCls} resize-none`}
                  rows={3}
                />
              </div>

              <div>
                <label className={labelCls}>Cover Image</label>
                {newPublication.imageUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={newPublication.imageUrl}
                      alt="cover"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setNewPublication({ ...newPublication, imageUrl: undefined })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="contentImage"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.url) setNewPublication({ ...newPublication, imageUrl: res[0].url });
                    }}
                    onUploadError={(err) => alert(`Upload error: ${err.message}`)}
                    appearance={{
                      button: 'bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl px-4 py-2 hover:bg-[#235a40] transition-colors',
                      allowedContent: 'text-gray-400 text-xs mt-1',
                    }}
                  />
                )}
              </div>

              <div>
                <label className={labelCls}>PDF URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newPublication.pdfUrl || ''}
                  onChange={(e) =>
                    setNewPublication({ ...newPublication, pdfUrl: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowAddPubModal(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPublication}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Adding…' : 'Add Publication'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ADD PROJECT MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Add Project</h2>
              </div>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className={labelCls}>Project Title *</label>
                <input
                  type="text"
                  placeholder="Project title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['ONGOING', 'COMPLETED', 'PENDING'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, status: s })}
                      className={`p-3 border-2 rounded-xl text-sm font-semibold transition-all ${
                        newProject.status === s
                          ? s === 'ONGOING'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : s === 'COMPLETED'
                            ? 'border-gray-400 bg-gray-100 text-gray-700'
                            : 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  placeholder="Brief project description (optional)"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  className={`${inputCls} resize-none`}
                  rows={3}
                />
              </div>

              <div>
                <label className={labelCls}>Student Count</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Number of students involved (e.g., 5)"
                  value={newProject.studentCount || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setNewProject({ ...newProject, studentCount: parseInt(val) || 0 });
                  }}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Project Image</label>
                {newProject.imageUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={newProject.imageUrl}
                      alt="project"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setNewProject({ ...newProject, imageUrl: undefined })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="contentImage"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.url) setNewProject({ ...newProject, imageUrl: res[0].url });
                    }}
                    onUploadError={(err) => alert(`Upload error: ${err.message}`)}
                    appearance={{
                      button: 'bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl px-4 py-2 hover:bg-[#235a40] transition-colors',
                      allowedContent: 'text-gray-400 text-xs mt-1',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Adding…' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ADD COURSE MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Add Course</h2>
              </div>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className={labelCls}>Course Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to Machine Learning"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Credit Hours</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g., 3"
                    value={newCourse.credits}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewCourse({ ...newCourse, credits: parseInt(val) || 0 });
                    }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Students Enrolled</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g., 45"
                    value={newCourse.students}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewCourse({ ...newCourse, students: parseInt(val) || 0 });
                    }}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Adding…' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
