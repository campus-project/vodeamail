FROM node:12-alpine as build

WORKDIR /usr/local/vodeamail-account-service

COPY dist package.json ./

RUN npm install --production

FROM node:12-alpine

WORKDIR /usr/local/vodeamail-account-service

COPY --from=build /usr/local/vodeamail-account-service .


CMD ["node", "src/main.js"]
