# Use an official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code to the container
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
