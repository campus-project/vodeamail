import { api, createCancelTokenHandler } from "../utilities/services";

const endPoint = () => process.env.REACT_APP_GATEWAY_ENDPOINT;

const Role = {
  all: function (params: any = null) {
    return api.get(`${endPoint()}/role`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.all.name
      ].handleRequestCancellation().token,
    });
  },
  show: function (id: number | string, params: any = null) {
    return api.get(`${endPoint()}/role/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.show.name
      ].handleRequestCancellation().token,
    });
  },
  create: function (payload: any, params: any = null) {
    return api.post(`${endPoint()}/role`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.create.name
      ].handleRequestCancellation().token,
    });
  },
  update: function (id: number | string, payload: any, params: any = null) {
    return api.put(`${endPoint()}/role/${id}`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.update.name
      ].handleRequestCancellation().token,
    });
  },
  delete: function (id: number | string, params: any = null) {
    return api.delete(`${endPoint()}/role/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.delete.name
      ].handleRequestCancellation().token,
    });
  },
};

export default Role;

const cancelTokenHandlerObject = createCancelTokenHandler(Role);
