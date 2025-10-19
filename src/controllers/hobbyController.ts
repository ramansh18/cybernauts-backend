import { Request, Response } from "express";
import {pool} from "../config/db";

export const HobbyController = {
  // Add a new hobby for a user
 async addHobby(req: Request, res: Response) {
  const { userId } = req.params;
  const { hobbyId } = req.body;

  if (!hobbyId) {
    return res.status(400).json({ message: "hobbyId is required." });
  }

  try {
    // Check if user exists
    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if hobby exists
    const hobbyCheck = await pool.query("SELECT id FROM hobbies WHERE id = $1", [hobbyId]);
    if (hobbyCheck.rowCount === 0) {
      return res.status(404).json({ message: "Hobby not found." });
    }

    // Check if hobby already linked to user
    const existing = await pool.query(
      "SELECT * FROM user_hobbies WHERE user_id = $1 AND hobby_id = $2",
      [userId, hobbyId]
    );

    if (existing.rowCount! > 0) {
      return res.status(409).json({ message: "Hobby already added for this user." });
    }

    // Insert mapping
    await pool.query(
      `INSERT INTO user_hobbies (user_id, hobby_id) VALUES ($1, $2)`,
      [userId, hobbyId]
    );

    res.status(201).json({ message: "Hobby added successfully for the user." });
  } catch (error: any) {
    console.error("Error adding hobby:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
},


  // Remove a hobby for a user
  async removeHobby(req: Request, res: Response) {
    const { userId } = req.params;
    const { hobby } = req.body;

    try {
      const result = await pool.query(
        "DELETE FROM hobbies WHERE user_id = $1 AND hobby = $2 RETURNING *",
        [userId, hobby]
      );

      if (result.rowCount === 0)
        return res.status(404).json({ message: "Hobby not found or already deleted." });

      res.status(200).json({ message: "Hobby removed successfully." });
    } catch (error: any) {
      console.error("Error removing hobby:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },


  async getAllHobbies(req: Request, res: Response) {
    try {
      const result = await pool.query("SELECT id, name FROM hobbies ORDER BY name ASC");
      res.status(200).json(result.rows);
    } catch (error: any) {
      console.error("Error fetching hobbies:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async createHobby(req: Request, res: Response) {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Hobby name is required." });
    }

    try {
      // Check if hobby already exists (case-insensitive)
      const existing = await pool.query(
        "SELECT id FROM hobbies WHERE LOWER(name) = LOWER($1)",
        [name.trim()]
      );

      if (existing.rowCount! > 0) {
        return res.status(409).json({ message: "Hobby already exists." });
      }

      // Insert new hobby
      const result = await pool.query(
        "INSERT INTO hobbies (name) VALUES ($1) RETURNING id, name",
        [name.trim()]
      );

      res.status(201).json({
        message: "Hobby added successfully.",
        hobby: result.rows[0],
      });
    } catch (error: any) {
      console.error("Error creating hobby:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async deleteHobby(req: Request, res: Response) {
    const { hobbyId } = req.params;

    if (!hobbyId) {
      return res.status(400).json({ message: "hobbyId is required." });
    }

    try {
      // Check if hobby exists
      const existing = await pool.query("SELECT id FROM hobbies WHERE id = $1", [hobbyId]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ message: "Hobby not found." });
      }

      // Remove any user-hobby mappings first (to prevent foreign key errors)
      await pool.query("DELETE FROM user_hobbies WHERE hobby_id = $1", [hobbyId]);

      // Delete the hobby itself
      await pool.query("DELETE FROM hobbies WHERE id = $1", [hobbyId]);

      res.status(200).json({ message: "Hobby deleted successfully." });
    } catch (error: any) {
      console.error("Error deleting hobby:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
