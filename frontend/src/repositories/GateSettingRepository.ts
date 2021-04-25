import { api, createCancelTokenHandler } from "../utilities/services";

const endPoint = () => process.env.REACT_APP_GATEWAY_ENDPOINT;

const GateSetting = {
  all: function (params: any = null) {
    return api.get(`${endPoint()}/gate-setting`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.all.name
      ].handleRequestCancellation().token,
    });
  },
  show: function (id: number | string, params: any = null) {
    return api.get(`${endPoint()}/gate-setting/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.show.name
      ].handleRequestCancellation().token,
    });
  },
  create: function (payload: any, params: any = null) {
    return api.post(`${endPoint()}/gate-setting`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.create.name
      ].handleRequestCancellation().token,
    });
  },
  update: function (id: number | string, payload: any, params: any = null) {
    return api.put(`${endPoint()}/gate-setting/${id}`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.update.name
      ].handleRequestCancellation().token,
    });
  },
  delete: function (id: number | string, params: any = null) {
    return api.delete(`${endPoint()}/gate-setting/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.delete.name
      ].handleRequestCancellation().token,
    });
  },
};

export default GateSetting;

const cancelTokenHandlerObject = createCancelTokenHandler(GateSetting);
