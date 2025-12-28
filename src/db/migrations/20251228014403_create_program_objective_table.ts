import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('program_objective', function (table) {
    table.increments('id', { primaryKey: true });
    table.integer('program_id').notNullable().references('id').inTable('program');
    table.string('objective').notNullable();

    table.index('program_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('program_objective');
}
