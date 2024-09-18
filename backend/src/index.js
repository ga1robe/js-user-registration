/* backend/src/index.js */
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/* User model */
const User = mongoose.model("User", {
  email: String,
  password: String,
  isActive: Boolean,
  activationToken: String,
});

/* User registration */
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const user = new User({
      email,
      password: hashedPassword,
      isActive: false,
      activationToken,
    });

    await user.save();

    /* Send activation email */
    const transporter = nodemailer.createTransport({
      /* Configure your email service here */
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Activate your account",
      html: `Click <a href="${process.env.FRONTEND_URL}/activate/${activationToken}">here</a> to activate your account.`,
    });

    res.status(201).json({
      message:
        "User registered. Please check your email to activate your account.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

/* User login */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ message: "Invalid credentials or inactive account" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

/* User activation */
app.post("/api/activate", async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      email: decoded.email,
      activationToken: token,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid activation token" });
    }

    user.isActive = true;
    user.activationToken = null;
    await user.save();

    res.json({ message: "Account activated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error activating account" });
  }
});

/* User editing (protected route) */
app.put("/api/user", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { email, password } = req.body;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
});
/* User deletion (protected route) */
app.delete("/api/user", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdAndDelete(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
