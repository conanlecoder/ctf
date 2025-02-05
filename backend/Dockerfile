FROM node:16.8.0-alpine

WORKDIR /app

COPY .env /app/.env

# Install dependencies, including docker-machine
RUN apk add --no-cache bash python3 make g++ docker-cli docker-compose curl \
    && curl -L https://github.com/docker/machine/releases/download/v0.16.2/docker-machine-$(uname -s)-$(uname -m) > /usr/local/bin/docker-machine \
    && chmod +x /usr/local/bin/docker-machine

COPY --chown=node:node package.json ./
RUN npm install --silent
COPY --chown=node:node . .

# Copy the deployment script into the container
COPY ctf_deploy.sh /app/ctf_deploy.sh
RUN chmod +x /app/ctf_deploy.sh

EXPOSE 3000
USER node
CMD ["npm", "run", "dev"]
