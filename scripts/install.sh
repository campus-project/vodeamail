#!/bin/bash

npm --prefix api-gateway install &&
npm --prefix microservices/vodeamail-account-service install &&
npm --prefix microservices/vodeamail-audience-service install &&
npm --prefix microservices/vodeamail-campaign-service install &&
npm --prefix microservices/vodeamail-mailer-service install
