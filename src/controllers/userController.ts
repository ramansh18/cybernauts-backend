import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { FriendshipModel } from "../models/friendshipModel";

export const UserController = {
  // GET /api/users
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/users/:id
  getUserById: async (req: Request, res: Response) => {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // POST /api/users
  createUser: async (req: Request, res: Response) => {
    try {
      const { username, age, hobbies } = req.body;
        console.log(hobbies)
      if (!username || !age) {
        return res.status(400).json({ error: "username and age are required" });
      }

      const hobbiesArray: string[] = Array.isArray(hobbies) ? hobbies : [];

      const user = await UserService.createUser(username, age, hobbiesArray);

      res.status(201).json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // PUT /api/users/:id
  updateUser: async (req: Request, res: Response) => {
    try {
      const { username, age, hobbies } = req.body;
      const data: { username?: string; age?: number; hobbies?: string[] } = {};
      if (username) data.username = username;
      if (age) data.age = age;
      if (hobbies) data.hobbies = Array.isArray(hobbies) ? hobbies : [];

      const updatedUser = await UserService.updateUser(req.params.id, data);
      if (!updatedUser) return res.status(404).json({ error: "User not found" });
      res.json(updatedUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE /api/users/:id
  deleteUser: async (req: Request, res: Response) => {
    try {
      const result = await UserService.deleteUser(req.params.id);
      if (!result) return res.status(409).json({ error: "Cannot delete user with active friends" });
      res.json({ message: "User deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async linkFriend(req: Request, res: Response) {
    const { userId } = req.params;
    const { friendId } = req.body;

    if (!friendId) return res.status(400).json({ message: "friendId is required." });
    if (userId === friendId) return res.status(400).json({ message: "Cannot friend yourself." });

    try {
      await FriendshipModel.createFriendship(userId, friendId);
      res.status(201).json({ message: "Friendship created successfully." });
    } catch (error: any) {
      if (error.message.includes("exists")) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
    }
  },

  async unlinkFriend(req: Request, res: Response) {
    const { userId } = req.params;
    const { friendId } = req.body;

    try {
      await FriendshipModel.deleteFriendship(userId, friendId);
      res.status(200).json({ message: "Friendship removed successfully." });
    } catch (error: any) {
      if (error.message.includes("does not exist")) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  },
};
