# Multi-stage production build for uncflow ML Academy

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy application source code
COPY . .

# Compile TypeScript and build production bundle with Vite
RUN npm run build

# Stage 2: Ultra-lightweight production Nginx server (~25MB)
FROM nginx:alpine

# Copy custom Nginx configuration with SPA fallback and Gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled production assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
