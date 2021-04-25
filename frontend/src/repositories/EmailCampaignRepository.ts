import { api, createCancelTokenHandler } from "../utilities/services";

const endPoint = () => process.env.REACT_APP_GATEWAY_ENDPOINT;

const EmailCampaignRepository = {
  all: function (params: any = null) {
    return api.get(`${endPoint()}/email-campaign`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.all.name
      ].handleRequestCancellation().token,
    });
  },
  show: function (id: number | string, params: any = null) {
    return api.get(`${endPoint()}/email-campaign/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.show.name
      ].handleRequestCancellation().token,
    });
  },
  create: function (payload: any, params: any = null) {
    return api.post(`${endPoint()}/email-campaign`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.create.name
      ].handleRequestCancellation().token,
    });
  },
  update: function (id: number | string, payload: any, params: any = null) {
    return api.put(`${endPoint()}/email-campaign/${id}`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.update.name
      ].handleRequestCancellation().token,
    });
  },
  delete: function (id: number | string, params: any = null) {
    return api.delete(`${endPoint()}/email-campaign/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.delete.name
      ].handleRequestCancellation().token,
    });
  },
  widget: function (params: any = null) {
    return api.get(`${endPoint()}/email-campaign/view/widget`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.widget.name
      ].handleRequestCancellation().token,
    });
  },
  chart: function (params: any = null) {
    return api.get(`${endPoint()}/email-campaign/view/chart`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.chart.name
      ].handleRequestCancellation().token,
    });
  },
};

export default EmailCampaignRepository;

const cancelTokenHandlerObject = createCancelTokenHandler(
  EmailCampaignRepository
);
