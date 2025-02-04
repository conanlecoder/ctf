#!/bin/bash

# Color definitions
Col_Red='\033[1;31m'
Col_White='\033[1;37m'
Col_Default='\033[0;39m'
Col_Green='\033[1;32m'
Col_Cyan='\033[1;36m'

# DigitalOcean Access Token
access_token="YOUR_DIGITALOCEAN_ACCESS_TOKEN"

# Read parameters
droplet_name=$1
droplet_size=$2
docker_image=$3
dashboard_port=$4
ctfd_internal_port=8080

echo -e "${Col_Cyan}Deploying CTFd on DigitalOcean...${Col_Default}"

# Create the droplet
docker-machine create \
    --digitalocean-image ubuntu-22-04-x64 \
    --digitalocean-size "$droplet_size" \
    --driver digitalocean \
    --digitalocean-access-token "$access_token" \
    "$droplet_name"

# Get the public IP
ip_address=$(docker-machine ip ${droplet_name})
echo -e "${Col_Green}Droplet created with IP: $ip_address ${Col_White}"

# Wait for SSH to be ready
echo -e "${Col_Cyan}Waiting for SSH to be ready...${Col_Default}"
sleep 30  # Wait for instance to be ready

# SSH into the droplet and fix the APT issue before installing Docker
docker-machine ssh ${droplet_name} << EOF
    set -e  # Exit if any command fails

    echo -e "${Col_Cyan}Fixing APT repositories...${Col_Default}"
    sudo rm -rf /var/lib/apt/lists/*
    sudo apt-get clean
    sudo apt-get update --allow-releaseinfo-change

    echo -e "${Col_Cyan}Installing Docker...${Col_Default}"
    sudo apt-get install -y docker.io
    sudo systemctl enable docker
    sudo systemctl start docker
EOF

# Deploy CTFd
docker-machine ssh ${droplet_name} "docker pull ${docker_image}"
docker-machine ssh ${droplet_name} "docker run -d -p $dashboard_port:$ctfd_internal_port ${docker_image}"

echo -e "${Col_Green}CTFd is running at http://$ip_address:$dashboard_port${Col_Default}"
