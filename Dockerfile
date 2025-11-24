
FROM node:20-alpine AS builder
WORKDIR /app


COPY .env.prod ./.env.production


COPY package.json package-lock.json ./


RUN npm ci --legacy-peer-deps


COPY tsconfig.json ./ 
COPY tailwind.config.js ./ 
COPY postcss.config.js ./ 
COPY next.config.js ./ 


COPY src ./src 
COPY public ./public


RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5002 


RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs


COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5002

CMD ["node", "server.js"]
