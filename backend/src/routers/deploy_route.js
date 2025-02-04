const express = require("express");
const { deployDroplet } = require("../../controllers/deployController");

const router = express.Router();

// POST route to trigger a deployment
router.post("/deploy", deployDroplet);

module.exports = router;
