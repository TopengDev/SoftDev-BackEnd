const asyncHandler = require("express-async-handler");
const Group = require("../models/groupModel");
const User = require("../models/userModel");
const Task = require("../models/taskModel");
const path = require("path");

//Create a task
const createTask = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  let isOwner = false;

  group.members.map((member) => {
    if (member.userID == user._id.toString()) {
      if (member.role == "Owner") {
        isOwner = true;
      }
    }
  });

  if (!isOwner) {
    res.status(400);
    throw new Error("Only group owner is allowed to create a task");
  }

  const { tName, tDesc, tDate, tAssignedTo, tPriorityLevel } = req.body;
  const inputDate = tDate.split("-");
  const currentDate = new Date();
  const formattedDate = new Date(inputDate[0], inputDate[1] - 1, inputDate[2]);

  console.log(formattedDate);
  if (formattedDate < currentDate) {
    res.status(400);
    throw new Error("Please put a valid date");
  }

  const assignedUser = await User.findById(req.body.tAssignedTo);
  if (!assignedUser) {
    res.status(400);
    throw new Error("User to be assigned not found");
  }

  let assignedUserExists = false;

  group.members.map((member) => {
    if (member.userID.toString() == assignedUser._id.toString()) {
      assignedUserExists = true;
    }
  });

  if (!assignedUserExists) {
    res.status(400);
    throw new Error("The user to be assigned is not in the group");
  }

  if (!tPriorityLevel) {
    res.status(400);
    throw new Error("Set a priority Level");
  }

  if (!tName || !tDesc || !tDate) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  let createdTask = {
    taskName: tName,
    taskDescription: tDesc,
    taskDueDate: tDate,
    groupID: group._id,
    groupName: group.title,
    createdBy: user._id,
    createdByName: user.name,
    assignedTo: assignedUser._id,
    assignedToName: assignedUser.name,
    taskStatus: "On Process",
    priorityLevel: tPriorityLevel,
  };

  const newTask = await Task.create({ ...createdTask });

  const {
    taskName,
    taskDescription,
    taskDueDate,
    createdBy,
    createdByName,
    assignedTo,
    assignedToName,
    taskStatus,
    priorityLevel,
    _id,
  } = newTask;

  const pushedTask = {
    taskID: _id,
    taskName: taskName,
    taskDescription: taskDescription,
    taskDueDate: taskDueDate,
    createdBy: createdBy,
    createdByName: createdByName,
    assignedTo: assignedTo,
    assignedToName: assignedToName,
    taskStatus: taskStatus,
    priorityLevel: priorityLevel,
  };

  group.tasks.push(pushedTask);
  group.save();

  res.status(200).json(newTask);
});

//Delete a task
const deleteTask = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  const user = await User.findById(req.user.id);
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    res.status(400);
    throw new Error("Task not found");
  }

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  let isOwner = false;

  group.members.map((member) => {
    if (member.userID == user._id.toString()) {
      if (member.role == "Owner") {
        isOwner = true;
      }
    }
  });

  if (!isOwner) {
    res.status(400);
    throw new Error("Only group owner is allowed to delete a task");
  }

  const removedTask = task;
  const filteredGroupTasks = group.tasks.filter((taska) => {
    return taska.taskID.toString() != task._id.toString();
  });

  group.tasks = filteredGroupTasks;
  group.save();
  task.remove();

  res.status(200).json(removedTask);
});

//get Task Info
const getTask = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  const task = await Task.findById(req.params.taskId);
  const user = await User.findById(req.user.id);

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  if (!task) {
    res.status(400);
    throw new Error("Task not found");
  }

  let userExists = false;

  group.members.map((member) => {
    if (member.userID == user._id.toString()) {
      userExists = true;
    }
  });

  if (!userExists) {
    res.status(400);
    throw new Error("You dont have access to this task");
  }

  res.status(200).json(task);
});

//get group tasks
const getGroupTasks = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  const user = await User.findById(req.user.id);

  let userExists = false;

  group.members.map((member) => {
    if (member.userID.toString() == user._id.toString()) {
      userExists = true;
    }
  });

  if (!userExists) {
    res.status(400);
    throw new Error("You dont have access");
  }

  const tasks = [];

  if (req.query.filter) {
    console.log(req.query);
    if (req.query.filter == "finished") {
      group.finishedTasks.map((finishedTask) => {
        tasks.push(finishedTask);
      });
    } else if (req.query.filter == "on-process") {
      group.tasks.map((task) => {
        if (task.taskStatus == "On Process") {
          tasks.push(task);
        }
      });
    } else if (req.query.filter == "paused") {
      group.tasks.map((task) => {
        if (task.taskStatus == "Paused") {
          tasks.push(task);
        }
      });
    } else {
      res.status(400);
      throw new Error("No item matched the query");
    }
  } else {
    group.finishedTasks.map((finishedTask) => {
      tasks.push(finishedTask);
    });
    group.tasks.map((task) => {
      tasks.push(task);
    });
    console.log(tasks);
  }

  res.status(200).json(tasks);
});

//get individual tasks
const getIndividualTasks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  const tasks = await Task.find({});
  const userTasks = [];
  const individualTasks = [];

  tasks.map((task) => {
    if (task.assignedTo.toString() == user._id.toString()) {
      userTasks.push(task);
    }
  });

  if (req.query.filter) {
    if (req.query.filter == "finished") {
      userTasks.map((task) => {
        if (task.taskStatus == "Finished") {
          individualTasks.push(task);
        }
      });
    } else if (req.query.filter == "on-process") {
      userTasks.map((task) => {
        if (task.taskStatus == "On Process") {
          individualTasks.push(task);
        }
      });
    } else if (req.query.filter == "paused") {
      userTasks.map((task) => {
        if (task.taskStatus == "Paused") {
          individualTasks.push(task);
        }
      });
    } else {
      res.status(400);
      throw new Error("No item matched the query");
    }
    res.status(200).json(individualTasks);
    // console.log(group);
  } else {
    userTasks.map((task) => {
      if (task.assignedTo.toString() == user._id.toString()) {
        individualTasks.push(task);
      }
    });
    res.status(200).json(individualTasks);
  }
});

//finish a task
const finishTask = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const group = await Group.findById(req.params.id);
  const task = await Task.findById(req.params.taskId);

  if (!group) {
    res.status(400);
    throw new Error("Group not found");
  }

  if (!task) {
    res.status(400);
    throw new Error("Task not found");
  }

  let taskExistsInGroup = false;

  group.tasks.map((taska) => {
    if (taska.taskID.toString() == task._id.toString()) {
      taskExistsInGroup = true;
    }
  });

  if (!taskExistsInGroup) {
    res.status(400);
    throw new Error("Task is not related to group");
  }

  let isOwner = false;

  group.members.map((member) => {
    if (member.userID.toString() == user._id.toString()) {
      if (member.role == "Owner") {
        isOwner = true;
      }
    }
  });

  if (!isOwner) {
    res.status(400);
    throw new Error("Only group owner is allowed to tag a task as finished");
  }

  task.taskStatus = "Finished";
  task.save();

  const groupFinishedTask = group.tasks.filter(
    (taska) => taska.taskID.toString() == task._id.toString()
  );

  groupFinishedTask[0].taskStatus = "Finished";
  delete groupFinishedTask[0]._id;

  group.tasks = group.tasks.filter(
    (taska) => taska.taskID.toString() != groupFinishedTask[0].taskID.toString()
  );

  group.finishedTasks = [...group.finishedTasks, groupFinishedTask];

  group.save();

  console.log(groupFinishedTask);
  res.status(200).json(groupFinishedTask);
});

module.exports = {
  createTask,
  deleteTask,
  getTask,
  getGroupTasks,
  getIndividualTasks,
  finishTask,
};
