const asyncHandler = require("express-async-handler");

const Group = require("../models/groupModel"); // Imported 'Goal' model
const User = require("../models/userModel"); // Imported 'User' model

//Get specific group (by group ID)
const getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  const user = await User.findById(req.user.id).select("-password");

  let userExists = false;

  group.members.map((member) => {
    if (member.memberID.toString() == user._id) {
      userExists = true;
    }
  });

  if (group.founder.toString() == user._id || userExists) {
    res.status(200).json(group);
  } else {
    res.status(401);
    throw new Error("You have no access to this group");
  }
});

//Get all groups (joined or owned)
const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find();
  const user = await User.findById(req.user.id).select("-password");
  const myGroups = [];

  let userExists = false;

  groups.map((group) => {
    group.members.map((member) => {
      if (member.memberID.toString() == user._id) {
        userExists = true;
      }
    });
  });

  groups.map((group) => {
    if (group.founder.toString() == user._id || userExists) {
      myGroups.push(group);
    }
  });

  res.status(200).json(myGroups);
});

//Get owned groups
const getOwnedGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({});
  const ownedGroups = [];
  groups.map((group) => {
    if (group.founder == req.user.id) {
      ownedGroups.push(group);
    }
  });
  res.status(200).json(ownedGroups);
});

//Get joined groups
const getJoinedGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({});
  const joinedGroups = [];
  groups.map((group) => {
    group.members.map((member) => {
      if (member.memberID == req.user.id) {
        joinedGroups.push(group);
      }
    });
  });
  res.status(200).json(joinedGroups);
});

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

  const user = { memberID: req.user.id, memberName: req.user.name };

  group.members.push(user);
  group.save();

  return res.status(200).json(group);
});

//Modify a group
const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

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
    throw new Error("Group not found");
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

//Add new member
const addMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  const user = await User.findById(req.user.id);

  if (group.founder.toString() !== user.id) {
    res.status(401);
    throw new Error("Founder not authorized");
  }

  const { _id, name, email } = await User.findById(req.body.userID);
  const addedUser = { memberID: _id, memberName: name };

  if (!addedUser) {
    res.status(401);
    throw new Error("User not found");
  }

  const userExists = group.members.map((member) => {
    if (member.memberID.toString() == _id) {
      res.status(401);
      throw new Error("Member already exists");
    }
  });
  group.members.push(addedUser);
  group.save();
  res.status(201).json(group);
});

//Delete a member
const deleteMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  const user = await User.findById(req.user.id);

  if (group.founder.toString() !== user.id) {
    res.status(401);
    throw new Error("Founder not authorized");
  }

  const removedUser = await User.findById(req.body.userID).select("-password");

  if (!removedUser) {
    res.status(401);
    throw new Error("User not found");
  }

  if (removedUser._id.toString() == group.founder.toString()) {
    res.status(401);
    throw new Error("You can not remove yourself from the group");
  }

  group.members = group.members.filter(
    (member) => member.memberID != removedUser._id.toString()
  );

  group.save();
  res.status(200).json(group);
});

module.exports = {
  getGroup,
  getGroups,
  getOwnedGroups,
  getJoinedGroups,
  setGroup,
  updateGroup,
  deleteGroup,
  addMember,
  deleteMember,
};
