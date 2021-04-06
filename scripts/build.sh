#!/bin/bash

npm run --prefix api-gateway build &&
npm run --prefix microservices/vodeamail-account-service build &&
npm run --prefix microservices/vodeamail-audience-service build &&
npm run --prefix microservices/vodeamail-campaign-service build
