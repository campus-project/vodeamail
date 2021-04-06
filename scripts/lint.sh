#!/bin/bash

npm run --prefix api-gateway lint &&
npm run --prefix microservices/vodeamail-account-service lint &&
npm run --prefix microservices/vodeamail-audience-service lint &&
npm run --prefix microservices/vodeamail-campaign-service lint
