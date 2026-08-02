import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audio_content', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('url').notNullable();
    table.string('original_name');
    table.string('mime_type');
    table.integer('component_id').unsigned().notNullable();
    table.foreign('component_id').references('id').inTable('content_component').onDelete('CASCADE');
    table.unique('component_id');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('document_content', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('url').notNullable();
    table.string('original_name');
    table.string('mime_type');
    table.integer('component_id').unsigned().notNullable();
    table.foreign('component_id').references('id').inTable('content_component').onDelete('CASCADE');
    table.unique('component_id');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('embed_content', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('provider').notNullable();
    table.text('url').notNullable();
    table.integer('component_id').unsigned().notNullable();
    table.foreign('component_id').references('id').inTable('content_component').onDelete('CASCADE');
    table.unique('component_id');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('image_content', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('url').notNullable();
    table.string('original_name');
    table.string('mime_type');
    table.string('alt_text');
    table.text('caption');
    table.integer('component_id').unsigned().notNullable();
    table.foreign('component_id').references('id').inTable('content_component').onDelete('CASCADE');
    table.unique('component_id');
    table.timestamps(true, true);
  });

  return knex.transaction(async (trx) => {
    // 1. Create a new enum type with the additional values
    await trx.raw(`
      CREATE TYPE content_component_type_enum_type_new AS ENUM ('text', 'video', 'youtube', 'audio', 'document', 'embed', 'image')
    `);

    // 2. Alter the table to use the new enum type
    await trx.raw(`
      ALTER TABLE content_component
      ALTER COLUMN type TYPE content_component_type_enum_type_new
      USING type::text::content_component_type_enum_type_new
    `);

    // 3. Drop the old enum type
    await trx.raw(`
      DROP TYPE content_component_type_enum_type
    `);

    // 4. Rename the new enum type to the original name
    await trx.raw(`
      ALTER TYPE content_component_type_enum_type_new RENAME TO content_component_type_enum_type
    `);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    // 1. Remove rows that use the enum values being dropped
    //    (deleting the component cascades to its detail row)
    await trx('content_component').whereIn('type', ['audio', 'document', 'embed', 'image']).del();

    // 2. Reverse the enum extension
    await trx.raw(`
      CREATE TYPE content_component_type_enum_type_new AS ENUM ('text', 'video', 'youtube')
    `);

    await trx.raw(`
      ALTER TABLE content_component
      ALTER COLUMN type TYPE content_component_type_enum_type_new
      USING type::text::content_component_type_enum_type_new
    `);

    await trx.raw(`
      DROP TYPE content_component_type_enum_type
    `);

    await trx.raw(`
      ALTER TYPE content_component_type_enum_type_new RENAME TO content_component_type_enum_type
    `);
  });

  await knex.schema.dropTable('image_content');
  await knex.schema.dropTable('embed_content');
  await knex.schema.dropTable('document_content');
  await knex.schema.dropTable('audio_content');
}
