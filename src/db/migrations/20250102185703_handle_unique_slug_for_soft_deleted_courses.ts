import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop the existing unique constraint
  await knex.schema.alterTable('course', (table) => {
    table.dropUnique(['slug']);
  });

  // Create a partial unique index for non-deleted records
  await knex.schema.raw(`
    CREATE UNIQUE INDEX course_slug_unique_active
    ON course (slug)
    WHERE deleted_at IS NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Remove the partial unique index
  await knex.schema.raw(`
    DROP INDEX IF EXISTS course_slug_unique_active
  `);

  // Restore the original unique constraint
  await knex.schema.alterTable('course', (table) => {
    table.unique(['slug']);
  });
}
