/* eslint-disable react-hooks/exhaustive-deps */

import React, { useMemo } from "react";
import { jwtService } from "../services";
import { setUser } from "../../store/actions";
import { useDispatch, useSelector } from "react-redux";
import { OAuth2TokenContract } from "../services/PassportService";
import { useIsMounted } from "./index";

const useJwtService = (disableAutoFetchUser = false) => {
  const dispatch = useDispatch();
  const { isLogged } = useSelector(({ vodea }: any) => {
    return {
      isLogged: vodea.auth.isLogged,
    };
  });

  const isMounted = useIsMounted();
  const [isOnFetchingUser, setIsOnFetchingUser] = React.useState(
    !disableAutoFetchUser
  );

  const fetchUser = async () => {
    return new Promise(async (resolve, reject) => {
      const accessToken = jwtService.getAccessToken();
      if (accessToken && !isLogged) {
        setIsOnFetchingUser(true);

        await jwtService
          .fetchUser()
          .then((resp: any) => {
            dispatch(setUser(resp.data.data));
            resolve(resp);
          })
          .catch((e) => reject(e));

        if (isMounted.current) {
          setIsOnFetchingUser(false);
        }
      }

      resolve(true);
    });
  };

  const setAccessToken = (token: OAuth2TokenContract | null) => {
    return new Promise(async (resolve, reject) => {
      jwtService.setToken(token);

      if (!token) {
        resolve(true);
        return;
      }

      await fetchUser()
        .then((resp) => resolve(resp))
        .catch((e) => reject(e));
    });
  };

  useMemo(() => {
    (async () => {
      if (isOnFetchingUser) {
        await fetchUser()
          .then(() => {})
          .catch(() => {});
      }

      if (isMounted.current) {
        setIsOnFetchingUser(false);
      }
    })();
  }, [isOnFetchingUser]);

  return {
    isOnFetchingUser,
    fetchUser,
    setAccessToken,
  };
};

export default useJwtService;
