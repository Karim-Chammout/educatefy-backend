import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('account', function (table) {
    table.integer('preferred_language_id').unsigned().notNullable().defaultTo(147); // Default language is English
    table.foreign('preferred_language_id').references('id').inTable('language');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('account', (table) => {
    table.dropColumn('preferred_language_id');
  });
}
