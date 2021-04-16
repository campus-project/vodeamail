#!/bin/bash

npm --prefix api-gateway update vnest-core &&
npm --prefix microservices/vodeamail-account-service update vnest-core &&
npm --prefix microservices/vodeamail-audience-service update vnest-core &&
npm --prefix microservices/vodeamail-campaign-service update vnest-core
