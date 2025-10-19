import dotenv from "dotenv";

dotenv.config();
import app from "./app";
import { connectDB } from "./config/db";
import userRoutes from "./routes/userRoutes";
import hobbyRoutes from "./routes/hobbyRoutes";
import friendshipRoutes from "./routes/friendshipRoutes";

const PORT = process.env.PORT || 5000;
app.use("/api/users", userRoutes);
app.use("/api/hobbies", hobbyRoutes);
app.use('/api/friendships',friendshipRoutes);
app.listen(PORT, async () => {
  await connectDB();
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
