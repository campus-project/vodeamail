/* eslint-disable react-hooks/exhaustive-deps */

import React, { useMemo, useState } from "react";
import {
  useJwtService,
  useIsMounted,
  useQuerySearch,
  useVodeaCloudAccount,
} from "../../utilities/hooks";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";

const LoginVodeaCloudCallback: React.FC<any> = () => {
  const { code } = useQuerySearch();
  const isMounted = useIsMounted();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { setAccessToken } = useJwtService();
  const { getJwtTokenFromAuthorizationCode } = useVodeaCloudAccount();
  const { isOnFetchingUser } = useJwtService();

  const [preventLogin, setPreventLogin] = useState<boolean>(!!code);

  const { isLogged } = useSelector(({ vodea }: any) => {
    return {
      isLogged: vodea.auth.isLogged,
    };
  });

  const errorHandler = (e: any) => {
    const errorTranslation = e?.response?.status
      ? `common:error.${e.response.status}`
      : "common:error.other";

    enqueueSnackbar(t(errorTranslation), {
      variant: "error",
    });

    setTimeout(() => {
      if (isMounted.current) {
        setPreventLogin(false);
      }
    }, 1500);
  };

  useMemo(() => {
    (async () => {
      if (code) {
        let accessToken = null;

        await getJwtTokenFromAuthorizationCode(code)
          .then((resp) => (accessToken = resp.data))
          .catch(errorHandler);

        if (!accessToken) {
          return;
        }

        await setAccessToken(accessToken).catch(errorHandler);
      }
    })();
  }, []);

  if (isOnFetchingUser || preventLogin) {
    return <div>{t("common:redirecting")}...</div>;
  } else if (!isLogged) {
    return <Navigate to={"/"} />;
  }

  return null;
};

export default LoginVodeaCloudCallback;
