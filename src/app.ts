import express from "express";


const cors = require('cors');
const app = express();

// Allow requests from frontend
app.use(cors({
  origin: [
    'http://localhost:5173', // for local dev
    'https://cybernauts-frontend-igbl.vercel.app' // deployed frontend
  ],
  credentials: true
}));
app.use(express.json());

export default app;
