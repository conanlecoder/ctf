require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { deployDroplet } = require("./controllers/deployController");
const { createChall } = require("./controllers/challController");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Route to deploy a CTF challenge
app.post("/deploy", deployDroplet);

// Route to create a challenge and deploy it
app.post("/challenge/create/:category", createChall);

app.listen(5000, () => {
    console.log("🚀 Server is running on port 5000");
});
