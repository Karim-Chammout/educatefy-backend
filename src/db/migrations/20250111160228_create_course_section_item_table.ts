import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('course_section_item', function (table) {
    table.increments('id', { primaryKey: true });
    table.integer('course_section_id').unsigned().notNullable();
    table.foreign('course_section_id').references('id').inTable('course_section');
    table.integer('content_id').notNullable().comment('The attached content id, e.g. lesson_id');
    table
      .enum('content_type', ['lesson'], {
        useNative: true,
        enumName: 'course_section_item_content_type_enum_type',
      })
      .notNullable()
      .comment('The type of the attached content, e.g. lesson');
    table.integer('rank').notNullable().defaultTo(knex.raw('lastval()'));
    table.timestamps(true, true);

    table.index('course_section_id');
    table.index(['content_id', 'content_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('course_section_item');
}
