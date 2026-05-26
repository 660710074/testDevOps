FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl openssl-dev libc6-compat

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

FROM node:20-alpine

RUN apk add --no-cache dumb-init openssl libc6-compat

WORKDIR /app

RUN addgroup -g 1001 nodejs && adduser -S -u 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app .

USER nodejs

EXPOSE 8000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]