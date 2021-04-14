FROM node:12-alpine as build

WORKDIR /usr/local/vodeamail-campaign-service

COPY dist package.json ./

RUN npm install --production

FROM node:12-alpine

WORKDIR /usr/local/vodeamail-campaign-service

COPY --from=build /usr/local/vodeamail-campaign-service .


CMD ["node", "src/main.js"]
