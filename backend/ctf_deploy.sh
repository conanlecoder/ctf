#!/bin/bash

# Color definitions
Col_Red='\033[1;31m'
Col_White='\033[1;37m'
Col_Default='\033[0;39m'
Col_Green='\033[1;32m'
Col_Cyan='\033[1;36m'

# DigitalOcean Access Token
access_token="dop_v1_4c8a624599cfc4a6539de895aa1ec1fad7e38a5496bb7ff1ac7cf7652d66c234"

# Read parameters from Express backend
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

# Deploy CTFd
docker-machine ssh ${droplet_name} "docker pull ${docker_image}"
docker-machine ssh ${droplet_name} "docker run -d -p $dashboard_port:$ctfd_internal_port ${docker_image}"

echo -e "${Col_Green}CTFd is running at http://$ip_address:$dashboard_port"
