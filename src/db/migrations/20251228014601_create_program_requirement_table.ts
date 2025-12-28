import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('program_requirement', function (table) {
    table.increments('id', { primaryKey: true });
    table.integer('program_id').notNullable().references('id').inTable('program');
    table.string('requirement').notNullable();

    table.index('program_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('program_requirement');
}
