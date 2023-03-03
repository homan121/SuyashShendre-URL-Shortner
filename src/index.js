const express = require("express");
const mongoose = require("mongoose");
const route = require("./route/route");
const app = express();

app.use(express.json());
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true })
  .then(() => console.log("MongoDb Connected..."))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(3000, () => console.log("Express App Is Running On 3000."));
