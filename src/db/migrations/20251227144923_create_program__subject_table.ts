import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('program__subject', function (table) {
    table.comment(
      'This table represents the many-to-many relationship between "program" and "subject" tables.',
    );
    table.increments('id', { primaryKey: true });
    table.integer('program_id').notNullable().references('id').inTable('program');
    table.integer('subject_id').notNullable().references('id').inTable('subject');

    table.index('program_id');
    table.index('subject_id');
    table.unique(['program_id', 'subject_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('program__subject');
}
