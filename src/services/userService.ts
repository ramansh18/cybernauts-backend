import { UserModel } from "../models/userModel";
import { FriendshipModel } from "../models/friendshipModel";
import { HobbyModel } from "../models/hobbyModel";

// Utility to compute popularity score
const computePopularityScore = async (userId: string): Promise<number> => {
  const friends = await FriendshipModel.getFriends(userId);
  const userHobbies = await HobbyModel.getHobbiesOfUser(userId);

  let sharedHobbiesCount = 0;

  for (const friendId of friends) {
    const friendHobbies = await HobbyModel.getHobbiesOfUser(friendId);
    const shared = friendHobbies.filter((h) =>
      userHobbies.some((uh) => uh.id === h.id)
    );
    sharedHobbiesCount += shared.length;
  }

  return friends.length + sharedHobbiesCount * 0.5;
};

export const UserService = {
  async createUser(username: string, age: number, hobbies: string[] = []) {
    // Create user
    const user = await UserModel.createUser(username, age);

    // Process hobbies
    const hobbyRecords = [];
    for (const hobbyName of hobbies) {
      let hobby = await HobbyModel.getHobbyByName(hobbyName);
      if (!hobby) {
        hobby = await HobbyModel.createHobby(hobbyName);
      }
      await HobbyModel.addHobbyToUser(user.id, hobby.id);
      hobbyRecords.push(hobby);
    }

    const popularityScore = await computePopularityScore(user.id);

    return { ...user, hobbies: hobbyRecords, popularityScore };
  },

  async updateUser(
    id: string,
    data: { username?: string; age?: number; hobbies?: string[] }
  ) {
    const updatedUser = await UserModel.updateUser(id, data);
    if (!updatedUser) throw new Error("User not found");

    // Handle hobbies if provided
    let hobbyRecords = [];
    if (data.hobbies) {
      // Remove all current hobbies not in new list
      const currentHobbies = await HobbyModel.getHobbiesOfUser(id);
      const currentNames = currentHobbies.map(h => h.name);
      const hobbiesToRemove = currentHobbies.filter(h => !data.hobbies!.includes(h.name));
      for (const hobby of hobbiesToRemove) {
        await HobbyModel.removeHobbyFromUser(id, hobby.id);
      }

      // Add new hobbies
      for (const hobbyName of data.hobbies) {
        let hobby = await HobbyModel.getHobbyByName(hobbyName);
        if (!hobby) {
          hobby = await HobbyModel.createHobby(hobbyName);
        }
        // Add to user if not already linked
        if (!currentNames.includes(hobbyName)) {
          await HobbyModel.addHobbyToUser(id, hobby.id);
        }
        hobbyRecords.push(hobby);
      }
    } else {
      hobbyRecords = await HobbyModel.getHobbiesOfUser(id);
    }

    const popularityScore = await computePopularityScore(id);

    return { ...updatedUser, hobbies: hobbyRecords, popularityScore };
  },

  async getAllUsers() {
    const users = await UserModel.getAllUsers();
    const result = [];
    for (const user of users) {
      const popularityScore = await computePopularityScore(user.id);
      const hobbies = await HobbyModel.getHobbiesOfUser(user.id);
      result.push({ ...user, hobbies, popularityScore });
    }
    return result;
  },

  async getUserById(id: string) {
    const user = await UserModel.getUserById(id);
    if (!user) throw new Error("User not found");
    const popularityScore = await computePopularityScore(user.id);
    const hobbies = await HobbyModel.getHobbiesOfUser(id);
    return { ...user, hobbies, popularityScore };
  },

  async deleteUser(id: string) {
    const friends = await FriendshipModel.getFriends(id);
    if (friends.length > 0) return null;
    const deleted = await UserModel.deleteUser(id);
    if (!deleted) throw new Error("User not found");
    return true;
  },

  async addFriend(userId1: string, userId2: string) {
    await FriendshipModel.createFriendship(userId1, userId2);
    const score1 = await computePopularityScore(userId1);
    const score2 = await computePopularityScore(userId2);
    return { score1, score2 };
  },

  async removeFriend(userId1: string, userId2: string) {
    await FriendshipModel.deleteFriendship(userId1, userId2);
    const score1 = await computePopularityScore(userId1);
    const score2 = await computePopularityScore(userId2);
    return { score1, score2 };
  },

  async addHobby(userId: string, hobbyId: string) {
    await HobbyModel.addHobbyToUser(userId, hobbyId);
    return await computePopularityScore(userId);
  },

  async removeHobby(userId: string, hobbyId: string) {
    await HobbyModel.removeHobbyFromUser(userId, hobbyId);
    return await computePopularityScore(userId);
  },
};
