import { pool } from "../config/db";

export const HobbyModel = {
  // Create a new hobby
  async createHobby(name: string): Promise<{ id: string; name: string }> {
    const result = await pool.query(
      `INSERT INTO hobbies (name) VALUES ($1) RETURNING id, name`,
      [name]
    );
    return result.rows[0];
  },

  // Get all hobbies
  async getAllHobbies(): Promise<{ id: string; name: string }[]> {
    const result = await pool.query(`SELECT id, name FROM hobbies`);
    return result.rows;
  },

  // Add hobby to a user
  async addHobbyToUser(userId: string, hobbyId: string): Promise<void> {
    // Prevent duplicates
    const exists = await pool.query(
      `SELECT 1 FROM user_hobbies WHERE user_id = $1 AND hobby_id = $2`,
      [userId, hobbyId]
    );
    if (exists.rows.length > 0) return;

    await pool.query(
      `INSERT INTO user_hobbies (user_id, hobby_id) VALUES ($1, $2)`,
      [userId, hobbyId]
    );
  },

  // Remove hobby from a user
  async removeHobbyFromUser(userId: string, hobbyId: string): Promise<void> {
    await pool.query(
      `DELETE FROM user_hobbies WHERE user_id = $1 AND hobby_id = $2`,
      [userId, hobbyId]
    );
  },

  // Get hobbies of a user
  async getHobbiesOfUser(userId: string): Promise<{ id: string; name: string }[]> {
    const result = await pool.query(
      `SELECT h.id, h.name
       FROM user_hobbies uh
       JOIN hobbies h ON uh.hobby_id = h.id
       WHERE uh.user_id = $1`,
      [userId]
    );
    return result.rows;
  },
   getHobbyByName: async (name: string) => {
    const res = await pool.query('SELECT * FROM hobbies WHERE name = $1', [name]);
    return res.rows[0] || null;
  },
};
