FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 3000

# Start dev server (for production, use npm run build && serve -s dist)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
