const express = require("express");
const router = express.Router();

const {
  getGroup,
  getGroups,
  getOwnedGroups,
  getJoinedGroups,
  setGroup,
  updateGroup,
  deleteGroup,
  addMember,
  deleteMember,
  joinGroup,
  leaveGroup,
} = require("../controllers/groupController");

const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getGroups).post(protect, setGroup);
router.route("/owned").get(protect, getOwnedGroups);
router.route("/joined").get(protect, getJoinedGroups);
router
  .route("/:id")
  .get(protect, getGroup)
  .put(protect, updateGroup)
  .delete(protect, deleteGroup)
  .post(protect, addMember);
router.route("/:id/members").post(protect, deleteMember);
router.route("/:id/join").post(protect, joinGroup);
router.route("/:id/leave").post(protect, leaveGroup);

module.exports = router;
