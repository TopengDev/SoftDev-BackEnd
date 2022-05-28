const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/groupController");

const {
  createTask,
  deleteTask,
  getTask,
  getGroupTasks,
  finishTask,
} = require("../controllers/taskController");

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
router
  .route("/:id/tasks")
  .post(protect, createTask)
  .get(protect, getGroupTasks);
router
  .route("/:id/tasks/:taskId")
  .delete(protect, deleteTask)
  .get(protect, getTask);
router.route("/:id/tasks/:taskId/finish").post(protect, finishTask);
router.route("/:id/founder").get(protect, getGroupFounder);
// console.log(createTask);

module.exports = router;
