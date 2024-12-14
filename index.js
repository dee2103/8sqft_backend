import express from "express";
import dotenv from "dotenv";
import agreementRoutes from "./routes/agreementRoutes.js";
import viewRoutes from "./routes/viewRoutes.js";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

const app = express();

dotenv.config();

const port = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));


app.use(express.json());

app.use(cors());


app.use("/api/v1/", agreementRoutes);


app.use("/api/auth/", authRoutes);


app.use("/agreements", viewRoutes);   

app.get("/", (req, res) => {
  res.redirect("/agreements");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
