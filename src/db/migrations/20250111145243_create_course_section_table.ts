import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('course_section', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('denomination').notNullable();
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('id').inTable('course');
    table.boolean('is_published').notNullable().defaultTo(false);
    table.integer('rank').notNullable().defaultTo(knex.raw('lastval()'));
    table.timestamps(true, true);

    table.index('course_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('course_section');
}
