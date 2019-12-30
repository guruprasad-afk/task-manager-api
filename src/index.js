const express = require("express");

require("./db/mongoose");
const taskRouter = require("./routes/task-router");
const userRouter = require("./routes/user-router");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server is running on port:", port);
});
