const express = require("express");
const router = express.Router();

const { getIndividualTasks } = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");
// console.log(createTask + " Create Task");
router.route("/").get(protect, getIndividualTasks);

module.exports = router;
