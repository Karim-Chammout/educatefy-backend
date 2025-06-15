import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('student_teacher_follow', (table) => {
    table.increments('id', { primaryKey: true });
    table.integer('student_id').unsigned().notNullable();
    table.foreign('student_id').references('id').inTable('account');
    table.integer('teacher_id').unsigned().notNullable();
    table.foreign('teacher_id').references('id').inTable('account');
    table.boolean('is_following').notNullable().defaultTo(true);
    table.timestamps(true, true);

    // Ensure a student can only have one follow record per teacher
    table.unique(['student_id', 'teacher_id']);

    table.index('teacher_id');
    table.index('student_id');
    table.index(['teacher_id', 'is_following']);
    table.index(['student_id', 'is_following']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('student_teacher_follow');
}
