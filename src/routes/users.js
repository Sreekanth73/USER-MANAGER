const express = require("express");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

const router = new express.Router();
const User = require("../models/users");

if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

router.get("/", (req, res) => {
  res.render("index");
});

router.post("/signUp", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.redirect("/login");
  } catch (e) {
    res.render("signup", {
      message: e.message,
    });
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
    const token = await user.generateAuthToken();
    localStorage.setItem("Token", token);
    res.redirect("/users");
  } catch (error) {
    res.render("login", {
      message: e.message,
    });
  }
});

router.post("/users/edit/:id", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
    });
    await user.save();
    res.redirect("/users");
  } catch (e) {
    res.status(404).send(e);
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

router.get("/logout", auth, (req, res) => {
  localStorage.removeItem("myToken");
  res.redirect("/");
});

router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find();
    // res.send(req.user);
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

router.get("/users/findUser", auth, async (req, res) => {
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

router.get("/users/edit/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("edit", { user });
  } catch (e) {
    res.send(e);
  }
});

router.get("/users/delete/:id", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    res.redirect("/users");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
