# Build Stage
FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies including devDependencies for building
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Frontend and Backend
RUN npm run build

# Production Stage
FROM node:20-slim
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client for production environment
RUN npx prisma generate

# Ensure dist is treated as CommonJS
RUN echo '{"type": "commonjs"}' > dist/package.json

# Environment Setup
ENV NODE_ENV=production
ENV PORT=3000

# Persistence Volume
VOLUME /app/prisma

EXPOSE 3000

CMD ["node", "dist/api/server.js"]
