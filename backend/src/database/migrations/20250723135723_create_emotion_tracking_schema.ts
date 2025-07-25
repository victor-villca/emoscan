import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('image');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('emotion_types', (table) => {
    table.increments('id').primary();
    table.string('name', 50).unique().notNullable();
  });

  await knex.schema.createTable('sessions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.date('date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('participants', (table) => {
    table.increments('id').primary();
    table.integer('session_id').unsigned().notNullable();
    table.string('name').notNullable();
    table.string('face_snapshot_url');
    table
      .foreign('session_id')
      .references('id')
      .inTable('sessions')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('emotion_reports', (table) => {
    table.increments('id').primary();
    table.integer('participant_id').unsigned().notNullable();
    table
      .foreign('participant_id')
      .references('id')
      .inTable('participants')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('emotion_metrics', (table) => {
    table.increments('id').primary();
    table.integer('emotion_report_id').unsigned().notNullable();
    table.integer('emotion_type_id').unsigned().notNullable();
    table.decimal('percentage', 5, 2).notNullable();
    table.timestamp('detected_at').notNullable();
    table
      .foreign('emotion_report_id')
      .references('id')
      .inTable('emotion_reports')
      .onDelete('CASCADE');
    table.foreign('emotion_type_id').references('id').inTable('emotion_types');
  });

  await knex.schema.createTable('emotion_summaries', (table) => {
    table.increments('id').primary();
    table.integer('session_id').unsigned().unique().notNullable();
    table.decimal('happy', 5, 2).notNullable().defaultTo(0);
    table.decimal('sadness', 5, 2).notNullable().defaultTo(0);
    table.decimal('neutral', 5, 2).notNullable().defaultTo(0);
    table.decimal('angry', 5, 2).notNullable().defaultTo(0);
    table.decimal('surprise', 5, 2).notNullable().defaultTo(0);
    table.decimal('fear', 5, 2).notNullable().defaultTo(0);
    table
      .foreign('session_id')
      .references('id')
      .inTable('sessions')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('emotion_timelines', (table) => {
    table.increments('id').primary();
    table.integer('session_id').unsigned().notNullable();
    table.timestamp('timestamp').notNullable();
    table.integer('primary_emotion_id').unsigned().notNullable();
    table
      .foreign('session_id')
      .references('id')
      .inTable('sessions')
      .onDelete('CASCADE');
    table
      .foreign('primary_emotion_id')
      .references('id')
      .inTable('emotion_types');
  });

  await knex.schema.createTable('emotion_transitions', (table) => {
    table.increments('id').primary();
    table.integer('session_id').unsigned().notNullable();
    table.integer('emotion_from_id').unsigned().notNullable();
    table.integer('emotion_to_id').unsigned().notNullable();
    table.timestamp('started_at').notNullable();
    table.integer('duration_minutes').notNullable();
    table
      .foreign('session_id')
      .references('id')
      .inTable('sessions')
      .onDelete('CASCADE');
    table.foreign('emotion_from_id').references('id').inTable('emotion_types');
    table.foreign('emotion_to_id').references('id').inTable('emotion_types');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('emotion_transitions');
  await knex.schema.dropTableIfExists('emotion_timelines');
  await knex.schema.dropTableIfExists('emotion_summaries');
  await knex.schema.dropTableIfExists('emotion_metrics');
  await knex.schema.dropTableIfExists('emotion_reports');
  await knex.schema.dropTableIfExists('participants');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('emotion_types');
  await knex.schema.dropTableIfExists('users');
}
