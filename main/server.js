const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const port = process.env.PORT || 5000;
const path = require("path");
const cors = require("cors");

connectDB();

const app = express();

app.use(cors());

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
// });

app.use(express.static("./createTask"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
