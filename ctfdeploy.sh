#!/bin/bash

# Color definitions
Col_Red='\033[1;31m'
Col_White='\033[1;37m'
Col_Default='\033[0;39m'
Col_Green='\033[1;32m'
Col_Cyan='\033[1;36m'

# Hardcoded DigitalOcean Access Token (⚠ Keep this secure)
access_token="dop_v1_4c8a624599cfc4a6539de895aa1ec1fad7e38a5496bb7ff1ac7cf7652d66c234"

# Function to check if the droplet already exists
does_droplet_exist() {
    if [ "$(docker-machine ls -q $1 | grep $1)" ]; then
        return 0  # Droplet exists (true)
    else
        return 1  # Droplet does not exist (false)
    fi
}

echo -e "${Col_White}DigitalOcean CTFd Docker Deployment 3.3"
echo -e "${Col_Default}----------------------------------"

# Check whether docker-machine is installed
if ! [ -x "$(command -v docker-machine)" ]; then
    echo -e "${Col_Red}docker-machine not found. Make sure Docker is installed properly.${Col_Default}"
    exit 1
fi

# Prompt for the Docker image to run inside the droplet
echo -n -e "${Col_White}Docker image to deploy [conanthecoder/webctf:latest]: ${Col_Default}"
read docker_image
docker_image=${docker_image:-conanthecoder/webdiff:latest}

# Prompt for Droplet name
echo -e "\n${Col_Cyan}Provide the details for the new DigitalOcean Droplet:"
echo -n -e "${Col_White}Droplet name [CTFd]: ${Col_Default}"
read droplet_name
droplet_name=${droplet_name:-CTFd}

# Ensure the droplet name does not already exist
if does_droplet_exist "${droplet_name}"; then
    echo -e "${Col_Red}Droplet with name '${droplet_name}' already exists.${Col_Default}"
    exit 1
fi

# Prompt for Droplet size
echo -n -e "${Col_White}Droplet size [s-1vcpu-1gb]: ${Col_Default}"
read droplet_size
droplet_size=${droplet_size:-s-1vcpu-1gb}

# Prompt for CTFd exposed dashboard port
echo -n -e "${Col_White}CTFd dashboard exposed port [80]: ${Col_Default}"
read dashboard_port
dashboard_port=${dashboard_port:-80}

# Prompt for the internal CTFd port (default: 8080)
echo -n -e "${Col_White}CTFd internal container port [8080]: ${Col_Default}"
read ctfd_internal_port
ctfd_internal_port=${ctfd_internal_port:-8080}

# Final confirmation before proceeding
echo -e "\n${Col_White}Droplet name: '${droplet_name}'"
echo "Droplet size: ${droplet_size}"
echo "Dashboard Port: ${dashboard_port}"
echo "Internal Port: ${ctfd_internal_port}"
echo "Docker Image: ${docker_image}"
#echo -n -e "Proceed with droplet creation? [Y/n]: ${Col_Default}"
#read proceed
proceed=${proceed:-Y}
shopt -s nocasematch

if [[ $proceed != "Y" ]]; then
    echo -e "${Col_Red}Deployment aborted.${Col_Default}"
    exit 1
fi

# Create the droplet with a valid DigitalOcean image (Ubuntu 22.04)
echo -e "${Col_Cyan}Creating droplet '${droplet_name}' with Ubuntu 22.04...${Col_Default}"
docker-machine create \
    --digitalocean-image ubuntu-22-04-x64 \
    --digitalocean-size $droplet_size \
    --driver digitalocean \
    --digitalocean-access-token $access_token \
    $droplet_name

# Check if droplet creation was successful
if ! does_droplet_exist "${droplet_name}"; then
    echo -e "${Col_Red}Error: Droplet '${droplet_name}' not found. Check DigitalOcean for details.${Col_Default}"
    exit 1
fi

# Retrieve the droplet's public IP
ip_address=$(docker-machine ip ${droplet_name})
echo -e "\n${Col_Green}Droplet successfully created. IP Address: $ip_address ${Col_White}"

# Set up the environment to use the new droplet
echo -e "${Col_Cyan}Connecting to the new droplet...${Col_Default}"
eval $(docker-machine env $droplet_name)

# Fix APT Lock Issue
echo -e "${Col_Cyan}Checking for APT lock issues...${Col_Default}"
docker-machine ssh ${droplet_name} "while sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do echo 'Waiting for dpkg lock...'; sleep 5; done"

# Open TCP ports and allow incoming traffic
echo -e "${Col_Cyan}Configuring firewall to allow TCP connections...${Col_Default}"
docker-machine ssh ${droplet_name} "sudo ufw allow 2376/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw reload"

# Install Docker inside the droplet
#echo -e "${Col_Cyan}Installing Docker inside the droplet...${Col_Default}"
#docker-machine ssh ${droplet_name} 'curl -fsSL https://get.docker.com | sudo sh && sudo systemctl enable docker && sudo systemctl restart docker'

# Modify Docker Daemon to Listen on TCP
#echo -e "${Col_Cyan}Configuring Docker to listen on TCP...${Col_Default}"
#docker-machine ssh ${droplet_name} "echo '{\"hosts\": [\"tcp://0.0.0.0:2376\", \"unix:///var/run/docker.sock\"]}' | sudo tee /etc/docker/daemon.json"

# Restart Docker for changes to take effect
#echo -e "${Col_Cyan}Restarting Docker service...${Col_Default}"
#docker-machine ssh ${droplet_name} "sudo systemctl daemon-reexec && sudo systemctl restart docker"

# Verify Docker installation
echo -e "${Col_Cyan}Checking Docker installation...${Col_Default}"
docker-machine ssh ${droplet_name} 'docker --version'

# Pull the CTFd Docker image inside the droplet
echo -e "${Col_Cyan}Pulling Docker image...${Col_Default}"
docker-machine ssh ${droplet_name} "docker pull ${docker_image}"

# Deploy the CTFd Docker container inside the droplet
echo -e "${Col_Cyan}Deploying the CTFd Docker container...${Col_Default}"
docker-machine ssh ${droplet_name} "docker run -d -p $dashboard_port:$ctfd_internal_port ${docker_image}"

# Verify running containers
echo -e "${Col_Cyan}Verifying deployment...${Col_Default}"
docker-machine ssh ${droplet_name} "docker ps"

# Completion message
echo -e "\n${Col_White}CTFd is now running! Access it at: http://$ip_address:$dashboard_port"
echo -e "${Col_Green}Deployment complete.${Col_Default}"

# Keep the terminal open to see errors
echo -e "${Col_Cyan}Press Enter to exit...${Col_Default}"
read
