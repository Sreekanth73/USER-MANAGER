const express = require("express");
const router = new express.Router();
const Task = require("../models/tasks");

router.post("/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const task = await Task.find();
    res.status(200).send(task);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.patch("/tasks/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "error tasks" });
  }
  const _id = req.params.id;
  try {
    const task = await Task.findByIdAndUpdate(_id);
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(401).send(e);
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      res.status(400).send("no task found");
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
