const { exec } = require("child_process");
require("dotenv").config(); // Load environment variables

const deployDroplet = async (req, res) => {
    try {
        const { droplet_name, droplet_size, docker_image } = req.body;
        const dashboard_port = 80; // Fixed public port
        const ctfd_internal_port = 8080; // Fixed internal port

        if (!droplet_name || !docker_image || !droplet_size) {
            return res.status(400).json({ error: "Missing required parameters!" });
        }

        console.log(`🚀 Deploying ${docker_image} on DigitalOcean...`);

        // Step 1: Create DigitalOcean Droplet
        const createDropletCommand = `
            docker-machine create \
            --driver digitalocean \
            --digitalocean-access-token ${process.env.DO_TOKEN} \
            --digitalocean-image ubuntu-22-04-x64 \
            --digitalocean-size ${droplet_size} \
            --digitalocean-ssh-key-fingerprint ${process.env.DIGITALOCEAN_SSH_FINGERPRINT} \
            ${droplet_name}
        `;

        exec(createDropletCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Droplet creation failed: ${error.message}`);
                return res.status(500).json({ error: "Droplet creation failed!", details: error.message });
            }
            console.log(`✅ Droplet created: ${stdout}`);

            // Step 2: Get the Droplet's IP
            exec(`docker-machine ip ${droplet_name}`, (ipError, ipStdout) => {
                if (ipError) {
                    console.error(`❌ Failed to get droplet IP: ${ipError.message}`);
                    return res.status(500).json({ error: "Failed to retrieve droplet IP" });
                }

                const dropletIP = ipStdout.trim();
                console.log(`🔍 Droplet is active at IP: ${dropletIP}`);

                // Step 3: Deploy Docker image inside the Droplet via SSH (No Password Needed)
                const deployCommand = `
                    ssh root@${dropletIP} "
                    sudo apt update && sudo apt install -y docker.io &&
                    sudo docker pull ${docker_image} &&
                    sudo docker run -d -p ${dashboard_port}:${ctfd_internal_port} ${docker_image}
                    "
                `;

                exec(deployCommand, (deployError, deployStdout, deployStderr) => {
                    if (deployError) {
                        console.error(`❌ Deployment failed: ${deployError.message}`);
                        return res.status(500).json({ error: "Deployment failed!", details: deployError.message });
                    }
                    console.log(`✅ Deployment successful: ${deployStdout}`);
                    res.status(200).json({
                        message: "Deployment successful!",
                        challenge_url: `http://${dropletIP}:${dashboard_port}`
                    });
                });
            });
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { deployDroplet };
