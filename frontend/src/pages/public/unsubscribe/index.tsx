/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import { useDocumentTitle, useQuerySearch } from "../../../utilities/hooks";
import { Box, Typography } from "@material-ui/core";
import useStyles from "./style";
import axios from "axios";
import validator from "validator";
import { unsubscribeUrl } from "../../../utilities/helpers";

const Unsubscribe: React.FC<any> = () => {
  useDocumentTitle("Unsubscribe Mailing - VodeaMail");

  const classes = useStyles();
  const { ref = "" } = useQuerySearch();

  const unsubscribe = useCallback(async () => {
    if (!validator.isUUID(ref as string)) {
      return false;
    }

    const url = unsubscribeUrl();
    if (url !== undefined) {
      await axios.post(url, { ref });
    }
  }, [false]);

  useMemo(() => {
    unsubscribe().then();
  }, []);

  return (
    <Box className={classes.container}>
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Typography
          variant={"h6"}
          style={{ textTransform: "uppercase", marginBottom: 8 }}
        >
          We're sorry to see you go
        </Typography>
        <Typography>You are not longer subscribed to our emails,</Typography>
        <Typography>
          but there are more ways for you to stay in touch.
        </Typography>
      </Box>
    </Box>
  );
};

export default Unsubscribe;
