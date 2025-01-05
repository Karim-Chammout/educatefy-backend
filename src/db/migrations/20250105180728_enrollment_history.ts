import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('enrollment_history', function (table) {
    table.increments('id', { primaryKey: true });
    table.integer('enrollment_id').unsigned().notNullable();
    table.foreign('enrollment_id').references('id').inTable('enrollment');
    table
      .enum('old_status', null, {
        useNative: true,
        enumName: 'enrollment_status_type',
        existingType: true,
        schemaName: 'public',
      })
      .notNullable();
    table
      .enum('new_status', null, {
        useNative: true,
        enumName: 'enrollment_status_type',
        existingType: true,
        schemaName: 'public',
      })
      .notNullable();
    table.timestamps(true, true);

    table.index('enrollment_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('enrollment_history');
}
