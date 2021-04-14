import { api, createCancelTokenHandler } from "../utilities/services";

const endPoint = () => process.env.REACT_APP_GATEWAY_ENDPOINT;

const ContactRepository = {
  all: function (params: any = null) {
    return api.get(`${endPoint()}/contact`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.all.name
      ].handleRequestCancellation().token,
    });
  },
  show: function (id: number | string, params: any = null) {
    return api.get(`${endPoint()}/contact/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.show.name
      ].handleRequestCancellation().token,
    });
  },
  create: function (payload: any, params: any = null) {
    return api.post(`${endPoint()}/contact`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.create.name
      ].handleRequestCancellation().token,
    });
  },
  update: function (id: number | string, payload: any, params: any = null) {
    return api.put(`${endPoint()}/contact/${id}`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.update.name
      ].handleRequestCancellation().token,
    });
  },
  delete: function (id: number | string, params: any = null) {
    return api.delete(`${endPoint()}/contact/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.delete.name
      ].handleRequestCancellation().token,
    });
  },
};

export default ContactRepository;

const cancelTokenHandlerObject = createCancelTokenHandler(ContactRepository);
