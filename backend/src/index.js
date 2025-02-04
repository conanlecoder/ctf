const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import routes
const userRoute = require('./routers/user_route');
const challRoute = require('./routers/chall_route');
const categoriesRoute = require('./routers/categories_route');
const deployRoute = require('./routers/deploy_route'); // Add deployment route

require("../db/index"); // Connect to database

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/user', userRoute);
app.use('/api/chall', challRoute);
app.use('/api/categories', categoriesRoute);
app.use('/api/deploy', deployRoute); // New route for CTF deployment

// Handle 404 Not Found
app.all('*', (req, res) => {
    res.status(404).json({ success: false, msg: "Page not found." });
});

// Start server
app.listen(3000, () => {
    console.log("🚀 Server started on port 3000");
});
