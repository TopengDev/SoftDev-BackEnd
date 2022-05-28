const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    taskName: {
      type: String,
      required: true,
    },
    taskDescription: {
      type: String,
      required: true,
    },
    taskDueDate: {
      type: String,
      required: true,
    },
    groupID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    groupName: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdByName: {
      type: String,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedToName: {
      type: String,
    },
    taskStatus: {
      type: String,
    },
    priorityLevel: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
