# Use the official Node.js image.
FROM node:latest

# Set environment variables for npm global install
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=/home/node/.npm-global/bin:$PATH

# Install global dependencies
RUN npm i --unsafe-perm -g npm@latest expo-cli@latest @expo/ngrok@latest

# Install additional dependencies
RUN apt-get update && apt-get install -y qemu-user-static

# Create and set permissions for the app directory
RUN mkdir /opt/my-app && chown root:root /opt/my-app
WORKDIR /opt/my-app
ENV PATH=/opt/my-app/.bin:$PATH

# Switch to root user to install dependencies
USER root

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --unsafe-perm --legacy-peer-deps

# Copy the rest of the application code
COPY . /opt/my-app/

# Expose the port the app runs on
EXPOSE 8081

# Start the expo server
CMD ["npx", "expo", "start", "--tunnel"]