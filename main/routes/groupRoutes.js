const express = require("express");
const router = express.Router();

const {
  getOwnedGroups,
  setGroup,
  updateGroup,
  deleteGroup,
} = require("../controllers/groupController");

const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getOwnedGroups).post(protect, setGroup);
router.route("/:id").put(protect, updateGroup).delete(protect, deleteGroup);

module.exports = router;
