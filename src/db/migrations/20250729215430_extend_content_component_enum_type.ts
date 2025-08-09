import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.transaction(async (trx) => {
    // 1. Create a new enum type with the additional value
    await trx.raw(`
      CREATE TYPE content_component_type_enum_type_new AS ENUM ('text', 'video', 'youtube')
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
  return knex.transaction(async (trx) => {
    // Reverse the process for rollback

    // 1. Create the original enum type
    await trx.raw(`
      CREATE TYPE content_component_type_enum_type_new AS ENUM ('text', 'video')
    `);

    // 2. Alter the table to use the original enum type
    // Note: This will fail if there are rows with 'youtube' value
    await trx.raw(`
      ALTER TABLE content_component 
      ALTER COLUMN type TYPE content_component_type_enum_type_new 
      USING type::text::content_component_type_enum_type_new
    `);

    // 3. Drop the current enum type
    await trx.raw(`
      DROP TYPE content_component_type_enum_type
    `);

    // 4. Rename the new enum type to the original name
    await trx.raw(`
      ALTER TYPE content_component_type_enum_type_new RENAME TO content_component_type_enum_type
    `);
  });
}
