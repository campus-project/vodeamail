import axios, { AxiosError, AxiosResponse } from "axios";
import moment from "moment";
import { jwtService } from "./index";

export interface OAuth2TokenContract {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

const KEY_ACCESS_TOKEN = "auth.access_token";
const KEY_REFRESH_TOKEN = "auth.refresh_token";
const KEY_EXPIRES_IN = "auth.expires_in";
const KEY_EXPIRES_AT = "auth.expires_at";

const endPoint = () => process.env.REACT_APP_JWT_ENDPOINT;

class VodeaCloudService {
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
    if (expiresAt && expiresAt <= moment().format("YYYY-MM-DD HH:mm:ss")) {
      return false;
    }

    return accessToken;
  };

  getRefreshToken = () => {
    const refreshToken = window.localStorage.getItem(KEY_REFRESH_TOKEN);
    if (!refreshToken) {
      return false;
    }

    return refreshToken;
  };

  setToken = (oauthToken: OAuth2TokenContract | null) => {
    if (oauthToken) {
      const expiredAt = moment(1000 * oauthToken.expires_in).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      localStorage.setItem(KEY_ACCESS_TOKEN, oauthToken.access_token);
      localStorage.setItem(KEY_EXPIRES_IN, String(oauthToken.expires_in));
      localStorage.setItem(KEY_EXPIRES_AT, String(expiredAt));

      if (oauthToken.refresh_token) {
        localStorage.setItem(KEY_REFRESH_TOKEN, oauthToken.refresh_token);
      }

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
    };

    return new Promise(async (resolve, reject) => {
      await axios
        .post(`${endPoint()}/auth/token`, credentials)
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
        .post(`${endPoint()}/account/logout`)
        .then((response: AxiosResponse) => resolve(response))
        .catch((error: AxiosError) => reject(error));

      this.setToken(null);
    });
  };

  fetchUser = () => {
    return new Promise((resolve, reject) => {
      axios
        .get(`${endPoint()}/account`)
        .then((response: AxiosResponse) => resolve(response))
        .catch((error: AxiosError) => {
          this.setToken(null);
          reject(error);
        });
    });
  };

  refreshAccessToken = () => {
    return new Promise((resolve, reject) => {
      if (!this.getRefreshToken()) {
        reject(false);
      }

      axios
        .post(`${endPoint()}/auth/refresh-token`, {
          refresh_token: this.getRefreshToken(),
        })
        .then((resp) => {
          jwtService.setToken(resp.data);
          resolve(resp.data.access_token);
        })
        .catch(() => reject(false));
    });
  };
}

const instance = new VodeaCloudService();

export default instance;
