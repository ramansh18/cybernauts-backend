import dotenv from "dotenv";
import cors from "cors";
import app from "./app";
import { connectDB } from "./config/db";
import userRoutes from "./routes/userRoutes";
import hobbyRoutes from "./routes/hobbyRoutes";
import friendshipRoutes from "./routes/friendshipRoutes";

dotenv.config();

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,       // deployed frontend
    'http://localhost:5173'         // local dev
  ],
  credentials: true
}));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/hobbies", hobbyRoutes);
app.use('/api/friendships', friendshipRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
