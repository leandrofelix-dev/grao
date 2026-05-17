FROM node:24-alpine AS build
WORKDIR /app
RUN apk add --no-cache vips-heif
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install

COPY . .
RUN yarn build

FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache vips-heif
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --production

COPY --from=build /app/dist dist
COPY --from=build /app/migrations migrations

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/presentation/app/index.js"]
