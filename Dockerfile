FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json tsconfig.node.json postcss.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src
ENV VITE_API_URL=/api
RUN npm run build

FROM node:20-alpine AS backend
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm ci
COPY server/ ./
COPY --from=frontend /app/dist /app/dist
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
