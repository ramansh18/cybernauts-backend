import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { FriendshipModel } from "../models/friendshipModel";

export const GraphController = {
  // GET /api/graph
  async getGraph(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();

      // Nodes for React Flow
      const nodes = users.map((user) => ({
        id: user.id,
        label: user.username,
        age: user.age,
        popularityScore: user.popularityScore,
        hobbies: user.hobbies?.map((h) => h.name) || [],
        type: user.popularityScore > 5 ? "highScoreNode" : "lowScoreNode", // optional for custom nodes
      }));

      // Edges for React Flow
      const edges: { id: string; source: string; target: string }[] = [];
      const addedEdges = new Set<string>();

      for (const user of users) {
        const friends = await FriendshipModel.getFriends(user.id);
        for (const friendId of friends) {
          // Create unique edge ID to prevent duplicates
          const edgeId = [user.id, friendId].sort().join("_");
          if (!addedEdges.has(edgeId)) {
            edges.push({
              id: edgeId,
              source: user.id,
              target: friendId,
            });
            addedEdges.add(edgeId);
          }
        }
      }

      res.json({ nodes, edges });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
