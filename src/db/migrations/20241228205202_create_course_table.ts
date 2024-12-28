import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('course', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('denomination').notNullable();
    table.string('slug').unique().notNullable();
    table.string('subtitle').notNullable();
    table.text('description').notNullable();
    table
      .enum('level', ['beginner', 'intermediate', 'advanced'], {
        useNative: true,
        enumName: 'course_level_enum_type',
      })
      .notNullable();
    table.string('image').nullable();
    table.string('external_resource_link').nullable();
    table.string('external_meeting_link').nullable();
    table.boolean('is_published').notNullable().defaultTo(false);
    table.integer('language_id').unsigned().notNullable();
    table.foreign('language_id').references('id').inTable('language');
    table.integer('teacher_id').unsigned().notNullable();
    table.foreign('teacher_id').references('id').inTable('account');
    table.timestamp('start_date').nullable();
    table.timestamp('end_date').nullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index('slug');
    table.index('teacher_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('course');
}
