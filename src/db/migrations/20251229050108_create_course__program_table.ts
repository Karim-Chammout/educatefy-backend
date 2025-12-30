import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('course__program', function (table) {
    table.comment(
      'This table represents the many-to-many relationship between "course" and "program" tables.',
    );
    table.increments('id', { primaryKey: true });
    table.integer('program_id').notNullable().references('id').inTable('program');
    table.integer('course_id').notNullable().references('id').inTable('course');
    table.integer('rank').notNullable().defaultTo(knex.raw('lastval()'));
    table.timestamps(true, true);

    table.index('program_id');
    table.index('course_id');
    table.unique(['program_id', 'course_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('course__program');
}
