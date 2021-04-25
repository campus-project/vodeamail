import { api, createCancelTokenHandler } from "../utilities/services";

const endPoint = () => process.env.REACT_APP_GATEWAY_ENDPOINT;

const User = {
  all: function (params: any = null) {
    return api.get(`${endPoint()}/user`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.all.name
      ].handleRequestCancellation().token,
    });
  },
  show: function (id: number | string, params: any = null) {
    return api.get(`${endPoint()}/user/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.show.name
      ].handleRequestCancellation().token,
    });
  },
  update: function (id: number | string, payload: any, params: any = null) {
    return api.put(`${endPoint()}/user/${id}`, payload, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.update.name
      ].handleRequestCancellation().token,
    });
  },
};

export default User;

const cancelTokenHandlerObject = createCancelTokenHandler(User);
