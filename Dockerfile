# Stage 1: Build stage
FROM node:20-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the application
# We need to pass VITE_ variables at build time if they are used in the client code
# (Wait, our proxies are on the server side now, but Supabase URL/Key are needed by the browser)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Stage 2: Production stage
FROM node:20-slim

WORKDIR /app

# Copy production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy the build output from the first stage
COPY --from=build /app/dist ./dist

# Copy the production server
COPY server-production.js ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server-production.js"]
