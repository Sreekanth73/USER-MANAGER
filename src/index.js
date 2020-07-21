const express = require("express");
require("./db/mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const hbs = require("hbs");

const userRouter = require("./routes/users");
const taskRouter = require("./routes/tasks");
const app = express();
const port = process.env.PORT;
const publicPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(publicPath));
app.use(userRouter);
app.use(taskRouter);
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.get("/*", (req, res) => {
  res.render("error", {
    message: "<h1>Incorrect Request</h1>",
  });
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
