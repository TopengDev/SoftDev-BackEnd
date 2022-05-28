const mongoose = require("mongoose");
const { userSchema } = require("./userModel");

const groupSchema = mongoose.Schema(
  // Create the 'Goal' model schema
  {
    groupFounder: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please add group title"],
    },
    description: {
      type: String,
      required: [true, "Please add group description"],
    },
    tag: {
      type: String,
      required: [true, "Please add a group tag"],
    },
    members: [
      {
        role: { type: String, required: true },
        userID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: {
          type: String,
        },
      },
    ],
    tasks: [
      {
        taskID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Task",
        },
        taskName: {
          type: String,
          required: [true, "Please add a name field"],
        },
        taskDescription: {
          type: String,
          required: [true, "Please add a description field"],
        },
        taskDueDate: {
          type: String,
          required: [true, "Please add a date field"],
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
        },
        taskStatus: {
          type: String,
          required: true,
        },
        priorityLevel: {
          type: Number,
        },
      },
    ],
    finishedTasks: [
      {
        taskID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Task",
        },
        taskName: {
          type: String,
        },
        taskDescription: {
          type: String,
        },
        taskDueDate: {
          type: String,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
        },
        taskStatus: {
          type: String,
        },
        priorityLevel: {
          type: Number,
        },
      },
    ],
    settings: {
      isOpenToPublic: { type: Boolean, required: true },
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("Group", groupSchema);
