// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum GenderType {
  Male = "male",
  Female = "female",
  Unknown = "unknown",
}

export enum Table {
  Account = "account",
  AccountSubject = "account__subject",
  AccountRole = "account_role",
  Country = "country",
  File = "file",
  Language = "language",
  Migrations = "migrations",
  MigrationsLock = "migrations_lock",
  OpenidClient = "openid_client",
  RefreshToken = "refresh_token",
  Subject = "subject",
}

export type Tables = {
  "account": Account,
  "account__subject": AccountSubject,
  "account_role": AccountRole,
  "country": Country,
  "file": File,
  "language": Language,
  "migrations": Migrations,
  "migrations_lock": MigrationsLock,
  "openid_client": OpenidClient,
  "refresh_token": RefreshToken,
  "subject": Subject,
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

export type Country = {
  id: number;
  iso: string;
  denomination: string;
  iso3: string | null;
  num_code: number | null;
  phone_code: number | null;
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

