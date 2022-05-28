const asyncHandler = require("express-async-handler");

const Group = require("../models/groupModel"); // Imported 'Goal' model
const User = require("../models/userModel"); // Imported 'User' model

const { defaultGroupConfig } = "./configs/defaultGroupConfig";

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
    if (member.userID.toString() == user._id) {
      userExists = true;
    }
  });

  if (group.groupFounder.toString() == user._id || userExists) {
    res.status(200).json(group);
  } else {
    res.status(401);
    throw new Error("You have no access to this group");
  }
});

//Get group founder name
const getGroupFounder = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  const user = await User.findById(req.user.id).select("-password");

  let userExists = false;

  group.members.map((member) => {
    if (member.userID.toString() == user._id) {
      userExists = true;
    }
  });

  if (group.groupFounder.toString() == user._id || userExists) {
    const groupFounder = await User.findById(group.groupFounder);
    const groupFounderName = await groupFounder.name;
    console.log(groupFounderName);
    res.status(200).json(groupFounderName);
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
  const sendingGroups = [];

  myGroups.splice(0, myGroups.length - 1);

  groups.map((group) => {
    group.members.map((member) => {
      if (member.userID.toString() == user._id) {
        myGroups.push(group);
      }
    });
  });

  console.log(myGroups);
  res.status(200).json(myGroups);
});

//Get owned groups
const getOwnedGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({});
  const ownedGroups = [];
  groups.map((group) => {
    if (group.groupFounder == req.user.id) {
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
      if (member.userID == req.user.id) {
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
    throw new Error("Please add a title field, and specify a title value");
  }
  if (!req.body.description) {
    res.status(400);
    throw new Error(
      "Please add description field, and specify a description value"
    );
  }
  if (!req.body.tag) {
    res.status(400);
    throw new Error("Please add a tag field, and specify a tag value");
  }

  let settings = {};

  if (req.body.isPublic) {
    if (req.body.isPublic == ("yes" || "true")) {
      settings = {
        isOpenToPublic: true,
      };
    }
  } else {
    settings = {
      isOpenToPublic: false,
    };
  }

  const group = await Group.create({
    groupFounder: req.user.id,
    title: req.body.title,
    description: req.body.description,
    tag: req.body.tag,
    settings: settings,
  });

  const user = {
    userID: req.user.id,
    name: req.user.name,
    role: "Owner",
  };

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

  if (group.groupFounder.toString() !== founder.id) {
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

  if (group.groupFounder.toString() !== founder.id) {
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

  if (group.groupFounder.toString() !== user.id) {
    res.status(401);
    throw new Error("Founder not authorized");
  }

  const { _id, name, email } = await User.findById(req.body.userID);
  const addedUser = { userID: _id, name: name, role: "Member" };

  if (!addedUser) {
    res.status(401);
    throw new Error("User not found");
  }

  const userExists = group.members.map((member) => {
    if (member.userID.toString() == _id) {
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

  if (group.groupFounder.toString() !== user.id) {
    res.status(401);
    throw new Error("Founder not authorized");
  }

  const removedUser = await User.findById(req.body.userID).select("-password");

  if (!removedUser) {
    res.status(401);
    throw new Error("User not found");
  }

  if (removedUser._id.toString() == group.groupFounder.toString()) {
    res.status(401);
    throw new Error("You can not remove the owner of this group");
  }

  const removeUser = () => {
    group.members = group.members.filter((member) => {
      return member.userID.toString() != removedUser._id.toString();
      console.log(group);
    });
  };

  let called = 0;

  group.members.map((member) => {
    if (member.userID.toString() == removedUser._id.toString()) {
      removeUser();
      called += 1;
    }
  });

  if (called > 0) {
    group.save();
    res.status(200).json(group);
  } else {
    res.status(400);
    throw new Error("User is not in the group");
  }
});

//Join a group
const joinGroup = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  if (group.settings.isOpenToPublic != true) {
    res.status(400);
    throw new Error("Can not join Private Group");
  }

  let userExists = false;

  group.members.map((member) => {
    if (member.userID.toString() == user._id.toString()) {
      userExists = true;
    }
  });

  if (userExists) {
    res.status(400);
    throw new Error("You already joined this group");
  }

  const { _id, name } = user;
  const joiningUser = { userID: _id, name: name, role: "Member" };

  group.members.push(joiningUser);
  group.save();

  res.status(200).json(group);
});

//Leave a group
const leaveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  const user = await User.findById(req.user.id).select("-password");

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  if (group.groupFounder.toString() == user._id.toString()) {
    res.status(400);
    throw new Error("Group founder can not leave");
  }

  let userExists = false;

  group.members.map((member) => {
    if (member.userID.toString() == user._id.toString()) {
      userExists = true;
    }
  });

  if (userExists) {
    group.members = group.members.filter((member) => {
      return member.userID.toString() != user._id.toString();
    });
    group.save();
  } else {
    res.status(400);
    throw new Error("You are not in this group");
  }

  res.status(200).json(group);
});

module.exports = {
  getGroup,
  getGroups,
  getGroupFounder,
  getOwnedGroups,
  getJoinedGroups,
  setGroup,
  updateGroup,
  deleteGroup,
  addMember,
  deleteMember,
  joinGroup,
  leaveGroup,
};
