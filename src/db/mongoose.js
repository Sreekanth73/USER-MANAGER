const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
var url = process.env.DB_URL;

mongoose.connect(url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
