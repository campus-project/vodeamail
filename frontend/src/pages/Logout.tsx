/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { logout as actionLogout } from "../store/actions";
import { useJwtService } from "../utilities/hooks";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

const Logout: React.FC<any> = () => {
  const dispatch = useDispatch();
  const { setAccessToken } = useJwtService();
  const navigate = useNavigate();

  useEffect(() => {
    setAccessToken(null).then(() => {
      dispatch(actionLogout());

      setTimeout(() => {
        navigate("/");
      }, 2000);
    });
  }, []);

  return <>Please wait...</>;
};

export default Logout;
