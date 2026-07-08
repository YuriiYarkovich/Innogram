FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install

FROM deps AS builder

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S expressjs -G nodejs

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist

USER expressjs

EXPOSE 3002

CMD ["node", "dist/main.js"]
