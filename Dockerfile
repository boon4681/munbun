FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack for yarn
RUN corepack enable

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/
RUN yarn install --immutable

COPY . .
RUN yarn build

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache python3 make g++

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/
RUN yarn install --immutable --production

COPY --from=builder /app/build ./build

# Create a volume for sqlite database
VOLUME /app/_munbun_

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "build/index.js"]
