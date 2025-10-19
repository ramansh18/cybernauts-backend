import { pool } from "../config/db";

interface User {
  id: string;
  username: string;
  age: number;
  createdAt: Date;
  friends: string[];
  hobbies: string[];
}

export const UserModel = {
  // Create a new user
  async createUser(username: string, age: number): Promise<User> {
    const numericAge = Number(age);
    const result = await pool.query(
      `INSERT INTO users (username, age) 
       VALUES ($1, $2) 
       RETURNING id, username, age, created_at AS "createdAt"`,
      [username, age]
    );
    const user = result.rows[0];
    user.friends = [];
    user.hobbies = [];
    return user;
  },

  // Get all users with friends and hobbies
  async getAllUsers(): Promise<User[]> {
    const usersRes = await pool.query(
      `SELECT id, username, age, created_at AS "createdAt" FROM users`
    );
    const users: User[] = [];

    for (const row of usersRes.rows) {
      const friends = await this.getFriends(row.id);
      const hobbies = await this.getHobbies(row.id);
      users.push({ ...row, friends, hobbies });
    }

    return users;
  },

  // Get single user by ID
  async getUserById(id: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, username, age, created_at AS "createdAt" FROM users WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;

    const friends = await this.getFriends(id);
    const hobbies = await this.getHobbies(id);
    return { ...result.rows[0], friends, hobbies };
  },

  // Update user info
  async updateUser(id: string, data: { username?: string; age?: number }): Promise<User | null> {
    const fields = [];
    const values: any[] = [];
    let idx = 1;

    if (data.username) {
      fields.push(`username = $${idx}`);
      values.push(data.username);
      idx++;
    }
    if (data.age) {
      fields.push(`age = $${idx}`);
      values.push(data.age);
      idx++;
    }
    if (fields.length === 0) return this.getUserById(id); // nothing to update

    values.push(id); // last parameter is WHERE id = $?
    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, username, age, created_at AS "createdAt"`,
      values
    );

    if (result.rows.length === 0) return null;

    const friends = await this.getFriends(id);
    const hobbies = await this.getHobbies(id);
    return { ...result.rows[0], friends, hobbies };
  },

  // Delete user (ensure no active friendships)
  async deleteUser(id: string): Promise<boolean> {
    const friends = await this.getFriends(id);
    if (friends.length > 0) {
      throw new Error("Cannot delete user with active friendships");
    }
    const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    const deleted = result.rowCount ?? 0;
    return deleted > 0;
  },

  // Get friends of a user
  async getFriends(id: string): Promise<string[]> {
    const result = await pool.query(
      `SELECT 
        CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END AS friend_id
       FROM friendships
       WHERE user1_id = $1 OR user2_id = $1`,
      [id]
    );
    return result.rows.map((r) => r.friend_id);
  },

  // Get hobbies of a user
  async getHobbies(id: string): Promise<string[]> {
    const result = await pool.query(
      `SELECT h.name
       FROM user_hobbies uh
       JOIN hobbies h ON uh.hobby_id = h.id
       WHERE uh.user_id = $1`,
      [id]
    );
    return result.rows.map((r) => r.name);
  },
};
