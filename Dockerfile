# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve Backend & Static Frontend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev
COPY backend/ ./backend/

# Copy built frontend assets to static serving directory in backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Environment configurations
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

WORKDIR /app/backend
CMD ["node", "server.js"]
```
