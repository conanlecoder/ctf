const axios = require("axios");
require("dotenv").config({ path: "/app/.env" });


const deployDroplet = async (req, res) => {
    try {
        const { droplet_name, droplet_size, docker_image } = req.body;
        const dashboard_port = 80;
        const internal_port = 8080;

        if (!droplet_name || !docker_image || !droplet_size) {
            return res.status(400).json({ error: "Missing required parameters!" });
        }

        console.log(`🚀 Deploying ${docker_image} on DigitalOcean...`);

        // Create Droplet with SSH Key
        const userDataScript = `#!/bin/bash
        apt update && apt install -y docker.io
        docker run -d -p ${internal_port}:${dashboard_port} ${docker_image}
        `;

        const createDroplet = await axios.post(
            "https://api.digitalocean.com/v2/droplets",
            {
                name: droplet_name,
                region: "nyc3",
                size: droplet_size,
                image: "ubuntu-22-04-x64",
                ssh_keys: [process.env.DIGITALOCEAN_SSH_FINGERPRINT], // Use SSH Key
                user_data: userDataScript // Auto-install Docker & deploy challenge
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.DO_TOKEN || DO_tOKENHARD}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!createDroplet.data.droplet) {
            return res.status(500).json({ error: "Failed to create DigitalOcean Droplet." });
        }

        const droplet_id = createDroplet.data.droplet.id;

        // Wait for Droplet to become Active
        let dropletIP = null;
        while (!dropletIP) {
            console.log(`🔄 Waiting for droplet ${droplet_name} to become active...`);
            await new Promise(resolve => setTimeout(resolve, 10000));

            const getDroplet = await axios.get(
                `https://api.digitalocean.com/v2/droplets/${droplet_id}`,
                { headers: { Authorization: `Bearer ${process.env.DO_TOKEN}` } }
            );

            if (getDroplet.data.droplet.networks.v4.length > 0) {
                dropletIP = getDroplet.data.droplet.networks.v4[0].ip_address;
            }
        }

        console.log(`✅ Droplet ${droplet_name} is active at IP: ${dropletIP}`);

        res.status(200).json({
            success: true,
            message: "Deployment successful!",
            challenge_url: `http://${dropletIP}:${dashboard_port}`
        });

    } catch (error) {
        console.error("❌ Deployment Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

module.exports = { deployDroplet };
