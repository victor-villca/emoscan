import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('emotion_types').del();

  const emotionTypes = [
    { id: 1, name: 'happy' },
    { id: 2, name: 'sadness' },
    { id: 3, name: 'neutral' },
    { id: 4, name: 'angry' },
    { id: 5, name: 'surprise' },
    { id: 6, name: 'fear' },
  ];

  await knex('emotion_types').insert(emotionTypes);
}
