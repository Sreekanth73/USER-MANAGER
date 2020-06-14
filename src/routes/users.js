const express = require("express");

const router = new express.Router();
const User = require("../models/users");

router.get("/", (req, res) => {
  res.render("index");
});

router.post("/addUser", async (req, res) => {
  const user = new User(req.body);
  if (user !== null || user !== "") {
    try {
      res.redirect("/");
      await user.save();
    } catch (e) {
      res.render("/");
    }
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

router.get("/users/new", async (req, res) => {
  try {
    res.render("addUser");
  } catch (e) {
    res.status(404).send(e);
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
