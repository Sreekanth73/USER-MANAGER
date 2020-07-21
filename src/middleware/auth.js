const jwt = require("jsonwebtoken");
const User = require("../models/users");
const jwt_key = process.env.JWT_SECRET_KEY;

const auth = async (req, res, next) => {
  try {
    const token = localStorage.getItem("Token");
    const decode = jwt.verify(token, jwt_key);
    const user = await User.findOne({ _id: decode._id });
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    return res.json({ message: "please Login" });
  }
};

module.exports = auth;
