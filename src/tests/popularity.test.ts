import request from 'supertest';
import app from '../app';
import { pool } from '../config/db';

describe('Popularity Score API', () => {
  let userA: any;
  let userB: any;
  let userC: any;

  beforeAll(async () => {
    await pool.query('TRUNCATE TABLE friendships, hobbies, users RESTART IDENTITY CASCADE;');

    const [resA, resB, resC] = await Promise.all([
      pool.query(`INSERT INTO users (username, age) VALUES ('A', 25) RETURNING *`),
      pool.query(`INSERT INTO users (username, age) VALUES ('B', 28) RETURNING *`),
      pool.query(`INSERT INTO users (username, age) VALUES ('C', 30) RETURNING *`),
    ]);

    userA = resA.rows[0];
    userB = resB.rows[0];
    userC = resC.rows[0];

    // Friendships (sorted for DB constraint)
    const pairs = [
      [userA.id, userB.id].sort(),
      [userA.id, userC.id].sort(),
    ];
    await pool.query(
      `INSERT INTO friendships (user1_id, user2_id) VALUES ($1, $2), ($3, $4)`,
      [...pairs[0], ...pairs[1]]
    );

    // Hobbies table
    await pool.query(`INSERT INTO hobbies (name) VALUES ('Cricket'), ('Music') RETURNING *`);

    // Assign hobbies via user_hobbies table
    const cricketRes = await pool.query(`SELECT id FROM hobbies WHERE name='Cricket'`);
    const musicRes = await pool.query(`SELECT id FROM hobbies WHERE name='Music'`);
    const cricketId = cricketRes.rows[0].id;
    const musicId = musicRes.rows[0].id;

    await pool.query(
      `INSERT INTO user_hobbies (user_id, hobby_id) VALUES ($1, $2), ($1, $3), ($4, $2)`,
      [userA.id, cricketId, musicId, userB.id]
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  test('should compute popularity score correctly', async () => {
    const res = await request(app).get(`/api/users/${userA.id}/popularity`);
    expect(res.status).toBe(200);

    // 2 friends + 1 shared hobby × 0.5 = 2 + 0.5 = 2.5
    expect(res.body.score).toBeCloseTo(2.5);
  });
});
