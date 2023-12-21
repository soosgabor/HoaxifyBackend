const express = require("express");
const User = require("../models/User");
const router = express.Router();

// User register
router.post("/users/token/:token", async (req, res, next) => {
  try {
    if (req.params.token === "1234") {
      await res.status(200).json({ success: true });
    } else {
      await res.status(400).json({ success: false });
    }
  } catch (error) {
    await res.status(400).json({ success: false, msg: error.message });
  }
});

// User create
router.post("/users", async (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const userSave = await user.save();
    res.status(201).json({ _id: userSave._id });
  } catch (error) {
    res.status(400).json({ message: error.errors });
    console.log(error);
  }
});

//Get all Users
router.get("/users", async (req, res) => {
  try {
    let user_count = (await User.find()).length;
    let total_pages;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;

    total_pages = Math.ceil(user_count / limit);

    const startIndex = (page-1) * limit;
    query = await User.find().skip(startIndex).limit(limit);
    res.json({
      content: query,
      user_count: user_count,
      page: page,
      size: limit,
      total_page: total_pages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Token megszerzése a modeltől, süti létrehozása és válasz küldése
const sendTokenResponse = (user, statusCode, res) => {
  // Token létrehozása
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

//Get User by Id
router.get("/user/:id", async (req, res) => {
  try {
    
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
