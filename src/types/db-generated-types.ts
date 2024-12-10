// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum Table {
  Migrations = "migrations",
  MigrationsLock = "migrations_lock",
  OpenidClient = "openid_client",
}

export type Tables = {
  "migrations": Migrations,
  "migrations_lock": MigrationsLock,
  "openid_client": OpenidClient,
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

