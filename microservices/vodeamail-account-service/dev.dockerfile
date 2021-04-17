FROM node:12-alpine as build

WORKDIR /app

COPY package.json ./

RUN npm install
RUN npm install -g node-gyp

COPY . .

FROM node:12-alpine

WORKDIR app

COPY --from=build /app ./

EXPOSE 3010

CMD ["npm", "run", "start:dev"]
