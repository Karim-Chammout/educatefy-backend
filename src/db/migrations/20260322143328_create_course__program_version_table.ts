import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('course__program_version', function (table) {
    table.comment(
      'This table represents the many-to-many relationship between "course" and "program_version" tables.',
    );
    table.increments('id', { primaryKey: true });
    table
      .integer('program_version_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('program_version');
    table.integer('course_id').unsigned().notNullable().references('id').inTable('course');
    table.integer('rank').notNullable().defaultTo(knex.raw('lastval()'));

    table
      .integer('prerequisite_course_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('course')
      .comment(
        'Optional foreign key to represent a prerequisite course for the given course in the context of the program version. If null, it means there are no prerequisites.',
      );

    table.timestamps(true, true);

    table.index('program_version_id');
    table.index('course_id');
    table.index('prerequisite_course_id');

    table.unique(['program_version_id', 'course_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('course__program_version');
}
