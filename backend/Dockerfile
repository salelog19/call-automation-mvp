FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN rm -f package-lock.json
COPY package-lock.json ./
RUN npm install

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS runtime
RUN apk add --no-cache curl ca-certificates
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "curl --version && echo 'Starting server...' && node dist/index.js"]
