import { api, createCancelTokenHandler } from "../utilities/services";

const endPoint = () => process.env.REACT_APP_GATEWAY_ENDPOINT;

const Permission = {
  all: function (params: any = null) {
    return api.get(`${endPoint()}/transaction`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.all.name
      ].handleRequestCancellation().token,
    });
  },
  show: function (id: number | string, params: any = null) {
    return api.get(`${endPoint()}/transaction/${id}`, {
      params,
      cancelToken: cancelTokenHandlerObject[
        this.show.name
      ].handleRequestCancellation().token,
    });
  },
};

export default Permission;

const cancelTokenHandlerObject = createCancelTokenHandler(Permission);
