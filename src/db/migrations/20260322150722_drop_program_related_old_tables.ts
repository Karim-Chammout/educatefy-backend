import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('course__program');
  await knex.schema.dropTableIfExists('program_progress');
  await knex.schema.raw(`DROP TYPE IF EXISTS program_progress_status_type`);
}

export async function down(_knex: Knex): Promise<void> {
  // No rollback needed since these tables are being dropped as part of a refactor.
}
