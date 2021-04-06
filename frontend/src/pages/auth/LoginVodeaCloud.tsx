import React, { useMemo } from "react";
import { useVodeaCloudAccount } from "../../utilities/hooks";

const LoginVodeaCloud: React.FC<any> = () => {
  const { authorizeUrl } = useVodeaCloudAccount();

  useMemo(() => {
    window.open(authorizeUrl, "_self");
  }, [authorizeUrl]);

  return null;
};

export default LoginVodeaCloud;
