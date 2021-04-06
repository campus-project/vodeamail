import { api, createCancelTokenHandler } from "../utilities/services";

const endPoint = () => process.env.REACT_APP_GATEWAY_ENDPOINT;

const CampaignEmailRepository = {
  all: function (params: any = null) {
    return api.get(`${endPoint()}/group`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.all.name
      ].handleRequestCancellation().token,
    });
  },
  show: function (id: number | string, params: any = null) {
    return api.get(`${endPoint()}/group/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.show.name
      ].handleRequestCancellation().token,
    });
  },
  create: function (payload: any, params: any = null) {
    return api.post(`${endPoint()}/group`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.create.name
      ].handleRequestCancellation().token,
    });
  },
  update: function (id: number | string, payload: any, params: any = null) {
    return api.put(`${endPoint()}/group/${id}`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.update.name
      ].handleRequestCancellation().token,
    });
  },
  delete: function (id: number | string, params: any = null) {
    return api.delete(`${endPoint()}/group/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.delete.name
      ].handleRequestCancellation().token,
    });
  },
};

export default CampaignEmailRepository;

const cancelTokenHandlerObject = createCancelTokenHandler(
  CampaignEmailRepository
);
