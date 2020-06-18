const express = require("express");
const bcrypt = require("bcryptjs");

const router = new express.Router();
const User = require("../models/users");

router.get("/", (req, res) => {
  res.render("index");
});

router.post("/signUp", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.redirect("/login");
  } catch (e) {
    res.render("/signup");
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await User.findOne({ email });
  try {
    if (!user) {
      return res.render("login", {
        message: "Unable to find user",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", {
        message: "Password does not match",
      });
    }
    res.redirect("/users");
  } catch (error) {
    res.send(error.message);
  }
});

router.get("/login", (req, res) => {
  try {
    res.render("login");
  } catch (e) {
    res.send({
      error: "cannot login",
    });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.render("users", { users });
  } catch (e) {
    res.send(e.message);
  }
});

router.get("/signUp", async (req, res) => {
  try {
    res.render("signUp");
  } catch (e) {
    res.redirect("/");
  }
});

router.get("/users/findUser", async (req, res) => {
  const name = new RegExp(req.query.name, "i");
  if (name !== null || name !== "") {
    try {
      const user = await User.findOne({ name });
      res.render("findUser", { user });
    } catch (e) {
      res.redirect("/");
    }
  }
});
router.patch("/users/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  console.log(isValidOperation);

  if (!isValidOperation) {
    return res.status(400).send({ error: "error" });
  }

  const _id = req.params.id;

  try {
    const user = await User.findByIdAndUpdate(_id);
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).send("no user found");
    }
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
