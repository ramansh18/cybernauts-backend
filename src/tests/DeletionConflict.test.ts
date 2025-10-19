import request from 'supertest';
import app from '../app';
import { pool } from '../config/db';

describe('User Deletion Conflict', () => {
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

    // Insert friendship respecting user1_id < user2_id
    const [id1, id2] = [userA.id, userB.id].sort();
    await pool.query(
      `INSERT INTO friendships (user1_id, user2_id) VALUES ($1, $2)`,
      [id1, id2]
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  test('should prevent deleting user with active friends', async () => {
    const res = await request(app).delete(`/api/users/${userA.id}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/active friends/i);
  });

  test('should allow deleting user after unlinking', async () => {
    const [id1, id2] = [userA.id, userB.id].sort();

    await request(app)
      .delete(`/api/users/${userA.id}/unlink`)
      .send({ friendId: userB.id });

    const friendshipRes = await pool.query(
      `SELECT * FROM friendships WHERE user1_id=$1 AND user2_id=$2`,
      [id1, id2]
    );
    expect(friendshipRes.rows.length).toBe(0);

    const res = await request(app).delete(`/api/users/${userA.id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });
});
