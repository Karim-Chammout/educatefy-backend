// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum ContentComponentParentTableEnumType {
  Lesson = "lesson",
  Course = "course",
}

export enum ContentComponentTypeEnumType {
  Text = "text",
  Video = "video",
}

export enum CourseLevelEnumType {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
}

export enum CourseSectionItemContentTypeEnumType {
  Lesson = "lesson",
}

export enum EnrollmentStatusType {
  Available = "available",
  Enrolled = "enrolled",
  Unenrolled = "unenrolled",
  Completed = "completed",
}

export enum GenderType {
  Male = "male",
  Female = "female",
  Unknown = "unknown",
}

export enum Table {
  Account = "account",
  AccountSubject = "account__subject",
  AccountRole = "account_role",
  ContentComponent = "content_component",
  Country = "country",
  Course = "course",
  CourseSubject = "course__subject",
  CourseObjective = "course_objective",
  CourseRequirement = "course_requirement",
  CourseSection = "course_section",
  CourseSectionItem = "course_section_item",
  Enrollment = "enrollment",
  EnrollmentHistory = "enrollment_history",
  File = "file",
  Language = "language",
  Lesson = "lesson",
  Migrations = "migrations",
  MigrationsLock = "migrations_lock",
  OpenidClient = "openid_client",
  RefreshToken = "refresh_token",
  Subject = "subject",
  TextContent = "text_content",
  VideoContent = "video_content",
}

export type Tables = {
  "account": Account,
  "account__subject": AccountSubject,
  "account_role": AccountRole,
  "content_component": ContentComponent,
  "country": Country,
  "course": Course,
  "course__subject": CourseSubject,
  "course_objective": CourseObjective,
  "course_requirement": CourseRequirement,
  "course_section": CourseSection,
  "course_section_item": CourseSectionItem,
  "enrollment": Enrollment,
  "enrollment_history": EnrollmentHistory,
  "file": File,
  "language": Language,
  "lesson": Lesson,
  "migrations": Migrations,
  "migrations_lock": MigrationsLock,
  "openid_client": OpenidClient,
  "refresh_token": RefreshToken,
  "subject": Subject,
  "text_content": TextContent,
  "video_content": VideoContent,
};

export type Account = {
  id: number;
  email: string;
  name: string | null;
  nickname: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: GenderType | null;
  date_of_birth: Date | null;
  avatar_url: string | null;
  external_account_id: string | null;
  external_account_provider: string | null;
  nationality_id: number | null;
  country_id: number | null;
  role_id: number;
  bio: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  preferred_language_id: number;
};

export type AccountSubject = {
  id: number;
  account_id: number;
  subject_id: number;
};

export type AccountRole = {
  id: number;
  denomination: string;
  code: string;
  description: string;
  created_at: Date;
  updated_at: Date;
};

export type ContentComponent = {
  id: number;
  denomination: string;
  parent_id: number;
  parent_table: ContentComponentParentTableEnumType;
  type: ContentComponentTypeEnumType;
  is_published: boolean;
  is_required: boolean;
  rank: number;
  created_at: Date;
  updated_at: Date;
};

export type Country = {
  id: number;
  iso: string;
  denomination: string;
  iso3: string | null;
  num_code: number | null;
  phone_code: number | null;
};

export type Course = {
  id: number;
  denomination: string;
  slug: string;
  subtitle: string;
  description: string;
  level: CourseLevelEnumType;
  image: string | null;
  external_resource_link: string | null;
  external_meeting_link: string | null;
  is_published: boolean;
  language_id: number;
  teacher_id: number;
  start_date: Date | null;
  end_date: Date | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type CourseSubject = {
  id: number;
  course_id: number;
  subject_id: number;
};

export type CourseObjective = {
  id: number;
  course_id: number;
  objective: string;
};

export type CourseRequirement = {
  id: number;
  course_id: number;
  requirement: string;
};

export type CourseSection = {
  id: number;
  denomination: string;
  course_id: number;
  is_published: boolean;
  rank: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type CourseSectionItem = {
  id: number;
  course_section_id: number;
  content_id: number;
  content_type: CourseSectionItemContentTypeEnumType;
  rank: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type Enrollment = {
  id: number;
  course_id: number;
  account_id: number;
  status: EnrollmentStatusType;
  created_at: Date;
  updated_at: Date;
};

export type EnrollmentHistory = {
  id: number;
  enrollment_id: number;
  old_status: EnrollmentStatusType;
  new_status: EnrollmentStatusType;
  created_at: Date;
  updated_at: Date;
};

export type File = {
  id: number;
  file_name: string;
  file_type: string;
  mime_type: string | null;
  size_in_bytes: number | null;
  key: string | null;
  uuid: string | null;
  account_id: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Language = {
  id: number;
  code: string;
  denomination: string;
};

export type Lesson = {
  id: number;
  denomination: string;
  is_published: boolean;
  duration: number;
  course_id: number;
  teacher_id: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type Migrations = {
  id: number;
  name: string | null;
  batch: number | null;
  migration_time: Date | null;
};

export type MigrationsLock = {
  index: number;
  is_locked: number | null;
};

export type OpenidClient = {
  id: number;
  denomination: string;
  identity_provider: string;
  button_text: string | null;
  button_icon: string | null;
  button_background_color: string | null;
  created_at: Date;
  updated_at: Date;
};

export type RefreshToken = {
  id: number;
  account_id: number;
  token: string;
  mobile: boolean;
  browser: string;
  expires_at: Date;
  last_used_at: Date;
  created_at: Date;
  updated_at: Date;
};

export type Subject = {
  id: number;
  denomination: string;
};

export type TextContent = {
  id: number;
  content: string;
  component_id: number;
  created_at: Date;
  updated_at: Date;
};

export type VideoContent = {
  id: number;
  url: string;
  component_id: number;
  created_at: Date;
  updated_at: Date;
};

