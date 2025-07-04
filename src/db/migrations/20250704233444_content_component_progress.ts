import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('content_component_progress', function (table) {
    table.increments('id', { primaryKey: true });
    table.integer('account_id').unsigned().notNullable();
    table.foreign('account_id').references('id').inTable('account');
    table.integer('content_component_id').unsigned().notNullable();
    table
      .foreign('content_component_id')
      .references('id')
      .inTable('content_component')
      .onDelete('CASCADE');
    table.integer('enrollment_id').unsigned().notNullable();
    table.foreign('enrollment_id').references('id').inTable('enrollment');
    table.boolean('is_completed').notNullable().defaultTo(false);
    table.timestamp('completed_at').nullable();
    table.timestamps(true, true);

    table.unique(['account_id', 'content_component_id']);
    table.index('account_id');
    table.index('content_component_id');
    table.index('enrollment_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('content_component_progress');
}
