FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm install --workspace=@chrono/shared --workspace=@chrono/api

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npm run build --workspace=@chrono/shared
RUN npm run build --workspace=@chrono/api

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
