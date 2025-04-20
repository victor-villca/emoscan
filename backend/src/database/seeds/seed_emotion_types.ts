import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('emotion_types').del();
  await knex('emotion_types').insert([
    { name: 'happy' },
    { name: 'sadness' },
    { name: 'neutral' },
    { name: 'angry' },
    { name: 'surprise' },
    { name: 'fear' }
  ]);
}
