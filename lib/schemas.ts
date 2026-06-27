import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

const optionalString = z.string().trim().max(500).optional().nullable();
const optionalText = z.string().trim().max(10000).optional().nullable();
const optionalUrl = z.string().trim().url().max(2000).optional().nullable();
const optionalDate = z.union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}/)]).optional().nullable();
const cuid = z.string().regex(/^c[a-zA-Z0-9]{24}$/, 'Invalid ID format');
const optionalCuid = cuid.optional().nullable();
const nonNegInt = z.number().int().nonnegative();
const nonNegNumber = z.number().nonnegative();

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding
// ─────────────────────────────────────────────────────────────────────────────

export const OnboardingSchema = z.object({
  designation: z.string().trim().min(1).max(100),
  departmentId: cuid,
  specialization: optionalString,
  experienceYears: optionalString,
  qualifications: optionalString,
});

// ─────────────────────────────────────────────────────────────────────────────
// Projects (teacher create/update)
// ─────────────────────────────────────────────────────────────────────────────

export const CreateProjectSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(300),
  description: optionalText,
  objectives: optionalText,
  methodology: optionalText,
  outcomes: optionalText,
  collaborators: optionalText,
  projectUrl: optionalUrl,
  projectKind: z.enum(['RESEARCH', 'INDUSTRY']).default('RESEARCH'),
  scope: z.enum(['NATIONAL', 'INTERNATIONAL']).default('NATIONAL'),
  // ORIC classification
  thematicArea: optionalString,
  projectCategory: optionalString,
  projectType: optionalString,
  funderType: optionalString,
  funderLocation: optionalString,
  funderCountry: optionalString,
  fundingCallTitle: optionalString,
  dateOfCirculation: optionalDate,
  submissionDeadline: optionalDate,
  // Industry
  projectFileNo: optionalString,
  financialYear: z.string().trim().max(20).optional().nullable(),
  awardDate: optionalDate,
  sponsoringAgency: optionalString,
  sponsorCountry: optionalString,
  sponsorAddress: optionalText,
  counterpartName: optionalString,
  counterpartCountry: optionalString,
  counterpartAddress: optionalText,
  // Work plan
  targetBeneficiaries: optionalText,
  deliverables: optionalText,
  monitoringPlan: optionalText,
  remarks: optionalText,
  // Budget (faculty-declared; ORIC confirms)
  budgetAmount: nonNegNumber.max(1e12).optional().nullable(),
  // Core
  startDate: optionalDate,
  endDate: optionalDate,
  studentCount: nonNegInt.max(1_000_000).default(0),
  imageUrl: optionalUrl,
  // Relations
  coPIs: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    designation: optionalString,
    organization: optionalString,
    contact: optionalString,
    email: z.string().trim().email().optional().nullable(),
    type: z.string().trim().max(50).optional().nullable(),
  })).max(20).optional(),
  teamMembers: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    designation: optionalString,
    department: optionalString,
    role: optionalString,
  })).max(50).optional(),
});

export const UpdateProjectSchema = z.object({
  title: z.string().trim().min(3).max(300).optional(),
  description: optionalText,
  objectives: optionalText,
  methodology: optionalText,
  outcomes: optionalText,
  collaborators: optionalText,
  projectUrl: optionalUrl,
  projectKind: z.enum(['RESEARCH', 'INDUSTRY']).optional(),
  scope: z.enum(['NATIONAL', 'INTERNATIONAL']).optional(),
  startDate: optionalDate,
  endDate: optionalDate,
  studentCount: nonNegInt.max(1_000_000).optional(),
  imageUrl: optionalUrl,
});

// ─────────────────────────────────────────────────────────────────────────────
// Publications
// ─────────────────────────────────────────────────────────────────────────────

export const CreatePublicationSchema = z.object({
  title: z.string().trim().min(1).max(500),
  year: z.number().int().min(1900).max(2100).default(() => new Date().getFullYear()),
  journal: optionalString,
  authors: z.string().trim().max(500).default('Unknown'),
  imageUrl: optionalUrl,
});

export const UpdatePublicationSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  journal: optionalString,
  imageUrl: optionalUrl,
});

// ─────────────────────────────────────────────────────────────────────────────
// Courses
// ─────────────────────────────────────────────────────────────────────────────

export const CreateCourseSchema = z.object({
  name: z.string().trim().min(1).max(200),
  credits: z.number().int().min(0).max(20).default(3),
  students: nonNegInt.max(1_000_000).default(0),
});

export const UpdateCourseSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  credits: z.number().int().min(0).max(20).optional(),
  students: nonNegInt.max(1_000_000).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin: staff create/update
// ─────────────────────────────────────────────────────────────────────────────

export const CreateStaffSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().toLowerCase().email(),
  designation: z.string().trim().min(1).max(100),
  departmentId: cuid,
  specialization: optionalString,
  experienceYears: optionalString,
  bio: optionalText,
  qualifications: optionalText,
});

export const UpdateStaffSchema = CreateStaffSchema.partial();

// ─────────────────────────────────────────────────────────────────────────────
// Admin: faculty approve/reject
// ─────────────────────────────────────────────────────────────────────────────

export const ApproveFacultySchema = z.object({
  notes: z.string().trim().max(1000).optional().default(''),
});

export const RejectFacultySchema = z.object({
  reason: z.string().trim().min(20, 'Rejection reason must be at least 20 characters').max(500),
});

// ─────────────────────────────────────────────────────────────────────────────
// ORIC: industrial visit
// ─────────────────────────────────────────────────────────────────────────────

export const CreateVisitSchema = z.object({
  visitorName: z.string().trim().min(1).max(200),
  visitorOrg: optionalString,
  visitDate: optionalDate,
  agenda: optionalText,
  departmentVisited: optionalString,
  visitType: optionalString,
  outcome: optionalText,
  proofUrl: optionalUrl,
  staffId: cuid,
});

export const UpdateVisitSchema = CreateVisitSchema.partial();
