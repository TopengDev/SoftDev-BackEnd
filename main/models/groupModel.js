const mongoose = require("mongoose");
const { userSchema } = require("./userModel");

const groupSchema = mongoose.Schema(
  // Create the 'Goal' model schema
  {
    founder: {
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
        memberID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        memberName: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", groupSchema);
