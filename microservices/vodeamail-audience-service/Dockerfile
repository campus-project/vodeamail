FROM node:12-alpine as build

WORKDIR /usr/local/vodeamail-audience-service

COPY dist package.json ./

RUN npm install --production

FROM node:12-alpine

WORKDIR /usr/local/vodeamail-audience-service

COPY --from=build /usr/local/vodeamail-audience-service .


CMD ["node", "src/main.js"]
