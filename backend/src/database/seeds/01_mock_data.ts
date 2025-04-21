import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  
  await knex('emotion_transitions').del();
  await knex('emotion_timelines').del();
  await knex('emotion_summaries').del();
  await knex('emotion_metrics').del();
  await knex('emotion_reports').del();
  await knex('participants').del();
  await knex('sessions').del();

  
  const emotions = ['happy', 'sadness', 'neutral', 'angry', 'surprise', 'fear'];
  const emotionTypeIds: Record<string, number> = {};

  for (const emotion of emotions) {
    const [record] = await knex('emotion_types')
      .insert({ name: emotion })
      .onConflict('name')
      .ignore()
      .returning(['id', 'name']);

    if (record) {
      emotionTypeIds[record.name] = record.id;
    } else {
      const existing = await knex('emotion_types').where({ name: emotion }).first();
      emotionTypeIds[emotion] = existing.id;
    }
  }

  
  const [session] = await knex('sessions')
    .insert({
      user_id: 1,
      name: 'Demo Session',
      date: new Date(),
      start_time: '10:00:00',
      end_time: '11:00:00',
    })
    .returning('id');

  const sessionId = session.id;

  
  const [participant] = await knex('participants')
    .insert({
      session_id: sessionId,
      name: 'Test Participant',
      face_snapshot_url: 'http://example.com/face.png',
    })
    .returning('id');

  const participantId = participant.id;

  
  const [emotionReport] = await knex('emotion_reports')
    .insert({ participant_id: participantId })
    .returning('id');

  const emotionReportId = emotionReport.id;

  
  await knex('emotion_metrics').insert([
    {
      emotion_report_id: emotionReportId,
      emotion_type_id: emotionTypeIds['happy'],
      percentage: 75.5,
      detected_at: new Date(),
    },
    {
      emotion_report_id: emotionReportId,
      emotion_type_id: emotionTypeIds['neutral'],
      percentage: 24.5,
      detected_at: new Date(),
    },
  ]);

  
  await knex('emotion_summaries').insert({
    session_id: sessionId,
    happy: 75.5,
    sadness: 0,
    neutral: 24.5,
    angry: 0,
    surprise: 0,
    fear: 0,
  });

  
  await knex('emotion_timelines').insert({
    session_id: sessionId,
    timestamp: new Date(),
    primary_emotion_id: emotionTypeIds['happy'],
  });

  
  await knex('emotion_transitions').insert({
    session_id: sessionId,
    emotion_from_id: emotionTypeIds['neutral'],
    emotion_to_id: emotionTypeIds['happy'],
    started_at: new Date(Date.now() - 5 * 60 * 1000), 
    duration_minutes: 5,
  });
}
