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
