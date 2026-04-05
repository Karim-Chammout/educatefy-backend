import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('enrollment', function (table) {
    table
      .integer('program_id')
      .nullable()
      .references('id')
      .inTable('program')
      .comment(
        'Foreign key to the program that the enrollment is associated with. This allows us to know wheather the enrollment is standalone or part of a program.',
      );

    table.index('program_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('enrollment', (table) => {
    table.dropColumn('program_id');
  });
}
