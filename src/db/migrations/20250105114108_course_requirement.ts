import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('course_requirement', function (table) {
    table.increments('id', { primaryKey: true });
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('id').inTable('course');
    table.string('requirement').notNullable();

    table.index('course_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('course_requirement');
}
