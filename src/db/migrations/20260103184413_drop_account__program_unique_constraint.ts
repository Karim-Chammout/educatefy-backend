import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('account__program', (table) => {
    table.dropUnique(['account_id', 'program_id']);
  });
}

export async function down(_knex: Knex): Promise<void> {
  // No rollback: original unique constraint was incorrect
}
