import { AxiosResponse } from "axios";
import { jwtService } from "./";

const axios = require("axios");

axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    return new Promise((resolve) => {
      const originalRequest = error.config;
      const responseStatus = error?.response?.status;

      if (
        responseStatus === 401 &&
        originalRequest &&
        !error.config.__isRetryRequest
      ) {
        originalRequest._retry = true;

        const response = jwtService.refreshAccessToken().then((accessToken) => {
          Object.assign(originalRequest.headers, {
            ...originalRequest.headers,
            Authorization: `Bearer ${accessToken}`,
          });

          return axios(originalRequest);
        });

        resolve(response);
      }

      //disable console error unauthorized
      if (responseStatus === 401) {
        return null;
      }

      return Promise.reject(error);
    });
  }
);

export default axios;

export const createCancelTokenHandler = (apiObject: any) => {
  // initializing the cancel token handler object
  const cancelTokenHandler: any = {};

  // for each property in apiObject, i.e. for each request
  Object.getOwnPropertyNames(apiObject).forEach((propertyName) => {
    // initializing the cancel token of the request
    const cancelTokenRequestHandler: any = {
      cancelToken: undefined,
    };

    // associating the cancel token handler to the request name
    cancelTokenHandler[propertyName] = {
      handleRequestCancellation: () => {
        // if a previous cancel token exists,
        // cancel the request
        if (cancelTokenRequestHandler.cancelToken) {
          cancelTokenRequestHandler.cancelToken.cancel(
            `${propertyName} canceled`
          );
        }

        // creating a new cancel token
        cancelTokenRequestHandler.cancelToken = axios.CancelToken.source();

        // returning the new cancel token
        return cancelTokenRequestHandler.cancelToken;
      },
    };
  });

  return cancelTokenHandler;
};
