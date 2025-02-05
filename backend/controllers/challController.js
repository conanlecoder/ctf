const Chall = require('../models/Chall');
const Categories = require('../models/Categories');
const axios = require('axios');
require("dotenv").config({ path: "/app/.env" });


/**
 * Retrieves challenges by category.
 */
const getChalls = async (req, res, categoryName) => {
    try {
        const category = await Categories.findOne({ name: categoryName }).populate('challenges');
        if (!category) {
            return res.status(404).json({ success: false, msg: "No challenges found for this category." });
        }
        res.status(200).json({ success: true, msg: "Challenges retrieved successfully", data: category.challenges });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: "Error retrieving challenges." });
    }
};

/**
 * Retrieves a challenge by ID.
 */
const getChallId = async (req, res, chall_id) => {
    try {
        const challenge = await Chall.findById(chall_id);
        if (!challenge) {
            return res.status(404).json({ success: false, msg: "Challenge not found." });
        }
        res.status(200).json({ success: true, msg: "Challenge retrieved successfully", data: challenge });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Error retrieving the challenge." });
    }
};

/**
 * Verifies the challenge flag.
 */
const verifyFlagChall = async (req, res, chall_id) => {
    try {
        const challenge = await Chall.findById(chall_id);
        if (!challenge) {
            return res.status(404).json({ success: false, msg: "Challenge not found." });
        }
        if (challenge.flags === req.body.flag) {
            if (!challenge.userValidated.includes(req.user._id)) {
                await Chall.findByIdAndUpdate(chall_id, { $push: { userValidated: req.user._id } });
                return res.status(200).json({ success: true, msg: "GG! Flag Accepted" });
            } else {
                return res.status(403).json({ success: false, msg: "You already validated this challenge." });
            }
        } else {
            return res.status(200).json({ success: false, msg: "Incorrect flag, try again!" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: "Error verifying flag." });
    }
};

/**
 * Deploys a CTF challenge on DigitalOcean.
 */
const createChall = async (req, res, categoryName) => {
    try {
        const { name, description, points, flags, docker_image, droplet_name, droplet_size } = req.body;
        const dashboard_port = 80;  // Fixed public port
        const internal_port = 8080; // Fixed internal container port

        if (!docker_image || !droplet_name || !droplet_size) {
            return res.status(400).json({ success: false, msg: "Missing deployment parameters." });
        }

        // Check if category exists, create if not
        let category = await Categories.findOne({ name: categoryName });
        if (!category) {
            category = await Categories.create({ name: categoryName });
        }

        console.log(`🚀 Deploying CTFd challenge: ${droplet_name} on DigitalOcean`);

        // **User Data script for automatic deployment**
        const userDataScript = `#!/bin/bash
        apt update && apt install -y docker.io
        docker run -d -p ${internal_port}:${dashboard_port} ${docker_image}
        `;

        // **Create Droplet on DigitalOcean**
        const createDroplet = await axios.post(
            "https://api.digitalocean.com/v2/droplets",
            {
                name: droplet_name,
                region: "nyc3", // Choose a region close to your audience
                size: droplet_size,
                image: "ubuntu-22-04-x64",
                ssh_keys: [process.env.DIGITALOCEAN_SSH_FINGERPRINT], // Use SSH key authentication
                user_data: userDataScript // **Runs on startup: installs Docker & deploys challenge**
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.DO_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!createDroplet.data.droplet) {
            return res.status(500).json({ success: false, msg: "Failed to create DigitalOcean Droplet." });
        }

        const droplet_id = createDroplet.data.droplet.id;

        // **Wait for the droplet to become active**
        let dropletIP = null;
        while (!dropletIP) {
            console.log(`🔄 Waiting for droplet ${droplet_name} to become active...`);
            await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10s before retrying

            const getDroplet = await axios.get(`https://api.digitalocean.com/v2/droplets/${droplet_id}`, {
                headers: {
                    Authorization: `Bearer ${process.env.DO_TOKEN}`,
                },
            });

            if (getDroplet.data.droplet.networks.v4.length > 0) {
                dropletIP = getDroplet.data.droplet.networks.v4[0].ip_address;
            }
        }

        console.log(`✅ Droplet ${droplet_name} is active at IP: ${dropletIP}`);

        // **Store challenge details in MongoDB**
        const newChall = await Chall.create({
            name,
            description,
            points,
            flags,
            url: `http://${dropletIP}:${internal_port}`,
            userValidated: [],
        });

        // **Link challenge to category**
        await Categories.findByIdAndUpdate(category._id, { $push: { challenges: newChall._id } });

        res.status(201).json({
            success: true,
            msg: "Challenge successfully created and deployed!",
            challenge_url: newChall.url,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: "Error during challenge creation." });
    }
};

/**
 * Updates a challenge by ID.
 */
const updateChall = async (req, res, chall_id) => {
    try {
        await Chall.findByIdAndUpdate(chall_id, { ...req.body });
        res.status(200).json({ success: true, msg: "Challenge updated successfully." });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Error updating challenge." });
    }
};

/**
 * Deletes a challenge by ID.
 */
const deleteChall = async (req, res, chall_id) => {
    try {
        await Chall.findByIdAndDelete(chall_id);
        res.status(200).json({ success: true, msg: "Challenge deleted successfully." });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Error deleting challenge." });
    }
};

module.exports = {
    getChalls,
    getChallId,
    verifyFlagChall,
    createChall,
    updateChall,
    deleteChall,
};
