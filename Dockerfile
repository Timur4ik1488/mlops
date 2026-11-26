# Multi-stage build for uncflow ML Academy with Automatic SSL (Caddy)

# Stage 1: Build React static assets
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Ultra-lightweight production server with automatic HTTPS (~15MB)
FROM caddy:2-alpine

COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
