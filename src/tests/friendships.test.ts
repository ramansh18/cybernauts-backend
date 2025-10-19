import request from 'supertest';
import app from '../app';
import { pool } from '../config/db';

describe('Friendship API', () => {
  let userA: any;
  let userB: any;

  beforeAll(async () => {
    await pool.query('TRUNCATE TABLE friendships, users RESTART IDENTITY CASCADE;');

    const resA = await pool.query(
      `INSERT INTO users (username, age) VALUES ('UserA', 25) RETURNING *`
    );
    const resB = await pool.query(
      `INSERT INTO users (username, age) VALUES ('UserB', 30) RETURNING *`
    );

    userA = resA.rows[0];
    userB = resB.rows[0];
  });

  afterAll(async () => {
    await pool.end();
  });

  test('should link two users successfully', async () => {
    const res = await request(app)
      .post(`/api/users/${userA.id}/link`)
      .send({ friendId: userB.id });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/linked/i);

    // Verify friendship exists in DB
    const [id1, id2] = [userA.id, userB.id].sort();
    const dbRes = await pool.query(
      `SELECT * FROM friendships WHERE user1_id=$1 AND user2_id=$2`,
      [id1, id2]
    );
    expect(dbRes.rows.length).toBe(1);
  });

  test('should unlink two users successfully', async () => {
    // Link first
    const [id1, id2] = [userA.id, userB.id].sort();
    await pool.query(
      `INSERT INTO friendships (user1_id, user2_id) VALUES ($1, $2)`,
      [id1, id2]
    );

    const res = await request(app)
      .delete(`/api/users/${userA.id}/unlink`)
      .send({ friendId: userB.id });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/unlinked/i);

    const dbRes = await pool.query(
      `SELECT * FROM friendships WHERE user1_id=$1 AND user2_id=$2`,
      [id1, id2]
    );
    expect(dbRes.rows.length).toBe(0);
  });
});
