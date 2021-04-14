import axios, { AxiosError, AxiosResponse } from "axios";
import moment from "moment";

export interface OAuth2TokenContract {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

const KEY_ACCESS_TOKEN = "auth.access_token";
const KEY_REFRESH_TOKEN = "auth.refresh_token";
const KEY_EXPIRES_IN = "auth.expires_in";
const KEY_EXPIRES_AT = "auth.expires_at";

const endPoint = () => process.env.REACT_APP_PASSPORT_END_POINT
const clientId = () => process.env.REACT_APP_PASSPORT_CLIENT_ID
const clientSecret = () => process.env.REACT_APP_PASSPORT_CLIENT_SECRET

class PassportService {
  constructor() {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  getAccessToken = () => {
    const accessToken = window.localStorage.getItem(KEY_ACCESS_TOKEN);
    if (!accessToken) {
      return false;
    }

    const expiresAt = window.localStorage.getItem(KEY_EXPIRES_AT);
    if (expiresAt && expiresAt <= moment().format("YYYY-MM-DD H:m:s")) {
      return false;
    }

    return accessToken;
  };

  setToken = (oauthToken: OAuth2TokenContract | null) => {
    if (oauthToken) {
      const expiredAt = moment()
        .add(oauthToken.expires_in, "seconds")
        .format("YYYY-MM-DD H:m:s");

      localStorage.setItem(KEY_ACCESS_TOKEN, oauthToken.access_token);
      localStorage.setItem(KEY_REFRESH_TOKEN, oauthToken.refresh_token);
      localStorage.setItem(KEY_EXPIRES_IN, String(oauthToken.expires_in));
      localStorage.setItem(KEY_EXPIRES_AT, String(expiredAt));

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${oauthToken.access_token}`;
    } else {
      localStorage.removeItem(KEY_ACCESS_TOKEN);
      localStorage.removeItem(KEY_REFRESH_TOKEN);
      localStorage.removeItem(KEY_EXPIRES_IN);
      localStorage.removeItem(KEY_EXPIRES_AT);

      delete axios.defaults.headers.common["Authorization"];
    }
  };

  login = (username: string, password: string, scope: string = "*") => {
    const credentials = {
      username,
      password,
      scope,
      grant_type: "password",
      client_id: clientId(),
      client_secret: clientSecret(),
    };

    return new Promise(async (resolve, reject) => {
      await axios
        .post(
          `${endPoint()}/oauth/token`,
          credentials
        )
        .then((response) => {
          this.setToken(response.data);
          resolve(response);
        })
        .catch((error: AxiosError) => {
          this.setToken(null);
          reject(error);
        });
    });
  };

  logout = async () => {
    return new Promise(async (resolve, reject) => {
      await axios
        .post(`${endPoint()}/api/account/logout`)
        .then((response: AxiosResponse) => resolve(response))
        .catch((error: AxiosError) => reject(error));

      this.setToken(null);
    });
  };

  fetchUser = () => {
    return new Promise((resolve, reject) => {
      axios
        .get(`${endPoint()}/api/account`)
        .then((response: AxiosResponse) => resolve(response))
        .catch((error: AxiosError) => {
          this.setToken(null);
          reject(error);
        });
    });
  };
}

const instance = new PassportService();

export default instance;
