const asyncHandler = require("express-async-handler");

const Group = require("../models/groupModel"); // Imported 'Goal' model
const User = require("../models/userModel"); // Imported 'User' model

//Get owned groups
const getOwnedGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ user: req.user.id });
  res.status(200).json(groups);
});

//Get joined groups (not finished yet)
// const getJoinedGroups = asyncHandler(async (req, res) => {
//   const groups = await Group.find({ user: req.user.id });
//   res.status(200).json(groups);
// });

//Create a group
const setGroup = asyncHandler(async (req, res) => {
  if (!req.body.title) {
    res.status(400);
    throw new Error("Please add a title field");
  }
  if (!req.body.description) {
    res.status(400);
    throw new Error("Please add description field");
  }
  if (!req.body.tag) {
    res.status(400);
    throw new Error("Please add a tag field");
  }

  const group = await Group.create({
    founder: req.user.id,
    title: req.body.title,
    description: req.body.description,
    tag: req.body.tag,
  });

  return res.status(200).json(group);
});

//Modify a group
const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findOne(req.params.id);

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  const founder = await User.findById(req.user.id);

  if (!group) {
    res.status(401);
    throw new Error("Founder not found");
  }

  if (group.founder.toString() !== founder.id) {
    res.status(401);
    throw new Error("Founder not authorized");
  }

  const updatedGroup = await Group.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  return res.status(200).json(updatedGroup);
});

//Delete a group
const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(400);
    throw new Error("Goal not found");
  }

  const founder = await User.findById(req.user.id);

  if (!founder) {
    res.status(401);
    throw new Error("Founder not found");
  }

  if (group.founder.toString() !== founder.id) {
    res.status(401);
    throw new Error("Founder not authorized");
  }

  const groups = await group.remove();

  return res.status(200).json(groups);
});

module.exports = { getOwnedGroups, setGroup, updateGroup, deleteGroup };
