FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/worker/package.json ./apps/worker/

RUN npm install --workspace=@chrono/shared --workspace=@chrono/worker

COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker

RUN npm run build --workspace=@chrono/shared
RUN npm run build --workspace=@chrono/worker

WORKDIR /app/apps/worker
CMD ["node", "dist/index.js"]
