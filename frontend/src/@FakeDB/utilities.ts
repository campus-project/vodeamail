export const generateGUID = () => {
  const S4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };

  return S4() + S4();
};

export type TypeStatusCode = 200 | 401 | 404 | 500;
const statusCodeOptions = {
  200: "OK",
  401: "UNAUTHORIZED",
  404: "NOT FOUND",
  500: "SERVER ERROR",
};

export const responseGenerator = (data: any, status: TypeStatusCode = 200) => {
  return [
    status,
    {
      data: data,
      status: statusCodeOptions[status],
      code: status,
    },
  ];
};

export const responseGeneratorPagination = (
  data: any,
  meta: any,
  status: TypeStatusCode = 200
) => {
  return [
    status,
    {
      data: data,
      meta: meta,
      status: statusCodeOptions[status],
      code: status,
    },
  ];
};
