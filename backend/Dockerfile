FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS runtime
RUN echo "Installing curl..." && apk update && apk add --no-cache curl ca-certificates && echo "Curl installed" && which curl && curl --version
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f -s http://127.0.0.1:3000/health || exit 1
CMD ["node", "dist/index.js"]
