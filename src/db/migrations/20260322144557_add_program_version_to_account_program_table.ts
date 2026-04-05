import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('account__program', function (table) {
    table.integer('program_version_id').notNullable().references('id').inTable('program_version');

    table.index('program_version_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('account__program', (table) => {
    table.dropColumn('program_version_id');
  });
}
