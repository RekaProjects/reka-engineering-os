// Dropdown options used across forms and filters

export const DISCIPLINES = [
  { value: 'mechanical',  label: 'Mechanical' },
  { value: 'civil',       label: 'Civil' },
  { value: 'structural',  label: 'Structural' },
  { value: 'electrical',  label: 'Electrical' },
  { value: 'other',       label: 'Other' },
] as const

export const SOURCE_PLATFORMS = [
  { value: 'upwork',    label: 'Upwork' },
  { value: 'fiverr',    label: 'Fiverr' },
  { value: 'direct',    label: 'Direct' },
  { value: 'referral',  label: 'Referral' },
  { value: 'other',     label: 'Other' },
] as const

export const TEAM_ROLES = [
  { value: 'lead',      label: 'Lead' },
  { value: 'engineer',  label: 'Engineer' },
  { value: 'drafter',   label: 'Drafter' },
  { value: 'checker',   label: 'Checker' },
  { value: 'support',   label: 'Support' },
] as const

export const PROJECT_STATUS_OPTIONS = [
  { value: 'new',              label: 'New' },
  { value: 'ready_to_start',   label: 'Ready to Start' },
  { value: 'ongoing',          label: 'Ongoing' },
  { value: 'internal_review',  label: 'Internal Review' },
  { value: 'waiting_client',   label: 'Waiting Client' },
  { value: 'in_revision',      label: 'In Revision' },
  { value: 'on_hold',          label: 'On Hold' },
  { value: 'completed',        label: 'Completed' },
  { value: 'cancelled',        label: 'Cancelled' },
] as const

export const WAITING_ON_OPTIONS = [
  { value: 'none',     label: 'None' },
  { value: 'internal', label: 'Internal' },
  { value: 'client',   label: 'Client' },
  { value: 'vendor',   label: 'Vendor' },
] as const

export const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

export const PROJECT_TYPES = [
  { value: 'design',        label: 'Design' },
  { value: 'analysis',      label: 'Analysis' },
  { value: 'drawing',       label: 'Drawing' },
  { value: 'consultation',  label: 'Consultation' },
  { value: 'inspection',    label: 'Inspection' },
  { value: 'other',         label: 'Other' },
] as const

export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
] as const

export const CLIENT_TYPES = [
  { value: 'company',    label: 'Company' },
  { value: 'individual', label: 'Individual' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'government', label: 'Government' },
  { value: 'other',      label: 'Other' },
] as const

export const CLIENT_STATUSES_OPTIONS = [
  { value: 'lead',     label: 'Lead' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
] as const

export const COMPLEXITY_OPTIONS = [
  { value: 'low',     label: 'Low' },
  { value: 'medium',  label: 'Medium' },
  { value: 'high',    label: 'High' },
  { value: 'unknown', label: 'Unknown' },
] as const

export const INTAKE_STATUS_OPTIONS = [
  { value: 'new',           label: 'New' },
  { value: 'awaiting_info', label: 'Awaiting Info' },
  { value: 'qualified',     label: 'Qualified' },
  { value: 'rejected',      label: 'Rejected' },
  { value: 'converted',     label: 'Converted' },
] as const
