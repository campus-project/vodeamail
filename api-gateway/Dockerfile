FROM node:12-alpine as build

WORKDIR /usr/local/vodeamail-api-gateway

COPY dist package.json ./

RUN npm install --production

FROM node:12-alpine

WORKDIR /usr/local/vodeamail-api-gateway

COPY --from=build /usr/local/vodeamail-api-gateway .

EXPOSE 3010

CMD ["node", "src/main.js"]
