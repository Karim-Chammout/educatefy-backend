import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('text_content', function (table) {
    table.unique(['component_id']);
  });

  await knex.schema.alterTable('video_content', function (table) {
    table.unique(['component_id']);
  });

  await knex.schema.alterTable('youtube_content', function (table) {
    table.unique(['component_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('youtube_content', function (table) {
    table.dropUnique(['component_id']);
  });

  await knex.schema.alterTable('video_content', function (table) {
    table.dropUnique(['component_id']);
  });

  await knex.schema.alterTable('text_content', function (table) {
    table.dropUnique(['component_id']);
  });
}
