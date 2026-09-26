require("dotenv").config();
const express = require("express");

// Added: DB connection + auth routes (Auth module)
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const app = express();

// Added: connect to MongoDB on server startup 
connectDB();

app.use(express.json());
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Added: mount authentication routes (register, login, protected /me) 
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

