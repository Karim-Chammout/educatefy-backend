import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('course_rating', function (table) {
    table.increments('id', { primaryKey: true });
    table.integer('account_id').unsigned().notNullable();
    table.foreign('account_id').references('id').inTable('account');
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('id').inTable('course');
    table.float('rating').checkBetween([1, 5]);
    table.text('review').nullable();
    table.timestamps(true, true);

    table.unique(['course_id', 'account_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('course_rating');
}
