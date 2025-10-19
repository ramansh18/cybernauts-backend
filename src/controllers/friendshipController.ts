import { Request, Response } from "express";
import { FriendshipModel } from "../models/friendshipModel";

export const FriendshipController = {


    // GET all friendships
  async getAllFriends(req: Request, res: Response) {
    try {
      const friendships = await FriendshipModel.getAllFriendships();
      res.status(200).json(friendships);
    } catch (error: any) {
      console.error("Error fetching friendships:", error.message);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },
 



  
};
