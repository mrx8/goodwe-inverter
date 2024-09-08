FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /opt/project
COPY package*.json ./
RUN npm ci
COPY . .
ARG TZ=CET
