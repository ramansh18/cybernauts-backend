import { pool } from "../config/db";

export const FriendshipModel = {
  // Check if a friendship exists (in either direction)
  async friendshipExists(userId1: string, userId2: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM friendships
       WHERE (user1_id = $1 AND user2_id = $2)
          OR (user1_id = $2 AND user2_id = $1)`,
      [userId1, userId2]
    );
    return result.rows.length > 0;
  },

  // Create a friendship between two users
  async createFriendship(userId1: string, userId2: string): Promise<void> {
  if (userId1 === userId2) {
    throw new Error("Cannot create friendship with the same user");
  }

  const exists = await this.friendshipExists(userId1, userId2);
  if (exists) {
    throw new Error("Friendship already exists");
  }

  // Order IDs to satisfy check constraint
  const [firstId, secondId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  await pool.query(
    `INSERT INTO friendships (user1_id, user2_id)
     VALUES ($1, $2)`,
    [firstId, secondId]
  );
},


  // Delete a friendship between two users
  async deleteFriendship(userId1: string, userId2: string): Promise<void> {
    const result = await pool.query(
      `DELETE FROM friendships
       WHERE (user1_id = $1 AND user2_id = $2)
          OR (user1_id = $2 AND user2_id = $1)`,
      [userId1, userId2]
    );

    if (result.rowCount === 0) {
      throw new Error("Friendship does not exist");
    }
  },

//fetch all friends of a user
  async getFriends(userId: string): Promise<string[]> {
    const result = await pool.query(
      `SELECT CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END AS friend_id
       FROM friendships
       WHERE user1_id = $1 OR user2_id = $1`,
      [userId]
    );
    return result.rows.map((r) => r.friend_id);
  },

  async getAllFriendships(): Promise<{ user1_id: string; user2_id: string; created_at: string }[]> {
  const result = await pool.query('SELECT * FROM friendships');
  return result.rows;
}

};
