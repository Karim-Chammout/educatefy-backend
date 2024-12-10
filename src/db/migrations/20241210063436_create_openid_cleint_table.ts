import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('openid_client', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('denomination').notNullable();
    table.string('identity_provider').notNullable();
    table.string('button_text').nullable();
    table.string('button_icon').nullable();
    table.string('button_background_color').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('openid_client');
}
