import axios from "axios";

const useVodeaCloudAccount = () => {
  const getAuthorizeHref = (): string => {
    const scope = ["*"].join("%20");
    const clientId = process.env.REACT_APP_VODEA_CLOUD_CLIENT_ID;
    const callbackUrl = process.env.REACT_APP_VODEA_CLOUD_CALLBACK_URL;
    const authorizationUrl =
      process.env.REACT_APP_VODEA_CLOUD_AUTHORIZATION_URL;

    return `${authorizationUrl}?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&scope=${scope}`;
  };

  const getJwtTokenFromAuthorizationCode = (code: any) => {
    const authorizationUrl = process.env.REACT_APP_JWT_ENDPOINT;
    const redirectUrl = process.env.REACT_APP_VODEA_CLOUD_CALLBACK_URL;

    return axios.post(`${authorizationUrl}/auth/vodea-cloud`, {
      redirect_uri: redirectUrl,
      code,
    });
  };

  return {
    authorizeUrl: getAuthorizeHref(),
    getJwtTokenFromAuthorizationCode,
  };
};

export default useVodeaCloudAccount;
