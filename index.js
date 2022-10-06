import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import postRoutes from "./routes/posts.js";

const app = express();
dotenv.config();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/posts", postRoutes); // it means every path in postRoutes will start with /posts/

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello to Memories Api");
});

mongoose
  .connect(process.env.CONNECTION_URL, { useNewUrlParser: true })
  .then(() =>
    app.listen(PORT, () => {
      console.log(`server is running on port no. ${PORT}`);
    })
  )
  .catch((error) => console.log(error));
