import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('youtube_content', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('youtube_video_id').notNullable();
    table.text('description');
    table.integer('component_id').unsigned().notNullable();
    table.foreign('component_id').references('id').inTable('content_component').onDelete('CASCADE');
    table.timestamps(true, true);

    table.index('component_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('youtube_content');
}
