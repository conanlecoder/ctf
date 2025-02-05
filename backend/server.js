require("dotenv").config({ path: "/app/.env" });
console.log("DO_TOKEN:", process.env.DO_TOKEN ? "Token Loaded" : "Token MISSING");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { deployDroplet } = require("./controllers/deployController");
const { createChall } = require("./controllers/challController");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/deploy", deployDroplet);
app.post("/challenge/create/:category", createChall);

app.listen(5000, () => {
    console.log("🚀 Server is running on port 5000");
});
