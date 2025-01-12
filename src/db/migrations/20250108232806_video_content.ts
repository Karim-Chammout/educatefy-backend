import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('video_content', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('url').notNullable();
    table.integer('component_id').unsigned().notNullable();
    table.foreign('component_id').references('id').inTable('content_component').onDelete('CASCADE');
    table.timestamps(true, true);

    table.index('component_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('video_content');
}
