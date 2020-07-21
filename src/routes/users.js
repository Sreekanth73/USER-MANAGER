const express = require("express");
const bcrypt = require("bcryptjs");

const path = require("path");
const auth = require("../middleware/auth");

const router = new express.Router();
const User = require("../models/users");
const multer = require("multer");
if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var upload = multer({
  storage: Storage,
  limits: {
    fileSize: 104 * 1024 * 5,
  },
  fileFilter,
}).single("image");

router.get("/", (req, res) => {
  res.render("index");
});

router.post("/upload", upload, (req, res) => {
  try {
    var message = req.file.filename + " uploaded successfully";
    res.render("upload", { message });
  } catch (error) {
    res.render("upload", { message: error.message });
  }
});

router.post("/signUp", upload, async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    image: req.file.filename,
  });

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

router.post("/users/edit/:id", upload, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { name: req.body.name, email: req.body.email, image: req.file.filename },
      {
        new: true,
      }
    );
    await user.save();
    res.redirect("/users");
  } catch (e) {
    res.render("edit", { message: e.message });
  }
});

router.get("/signUp", async (req, res) => {
  try {
    res.render("signUp");
  } catch (e) {
    res.redirect("/");
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
    console.log(users);
  } catch (e) {
    res.send(e.message);
  }
});

router.get("/upload", auth, (req, res) => {
  res.render("upload", {
    title: "Upload Image",
  });
});

router.get("/users/edit/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("edit", { user });
    console.log(user);
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
