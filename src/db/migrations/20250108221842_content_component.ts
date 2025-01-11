import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('content_component', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('denomination').notNullable();
    table
      .integer('parent_id')
      .notNullable()
      .comment('The parent table id, e.g. lessons_id or course_id');
    table
      .enum('parent_table', ['lesson', 'course'], {
        useNative: true,
        enumName: 'content_component_parent_table_enum_type',
      })
      .notNullable()
      .comment('The parent table name, e.g. lesson or course');
    table
      .enum('type', ['text', 'video'], {
        useNative: true,
        enumName: 'content_component_type_enum_type',
      })
      .notNullable()
      .comment('The type of the component, e.g. Text, Video, Quiz, etc...');
    table.boolean('is_published').notNullable().defaultTo(false);
    table.boolean('is_required').notNullable().defaultTo(false);
    table.integer('rank').notNullable().defaultTo(knex.raw('lastval()'));
    table.timestamps(true, true);

    table.index(['parent_id', 'parent_table']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('content_component');
}
