import express from "express";


const cors = require('cors');
const app = express();

// Allow requests from frontend
app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true // if you need cookies/auth
}));
app.use(express.json());

export default app;
