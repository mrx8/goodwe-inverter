FROM node:22-slim
ENV NODE_ENV=production
RUN npm install -g pnpm
WORKDIR /opt/project
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile
COPY . .
