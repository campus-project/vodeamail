/* eslint-disable @typescript-eslint/no-unused-vars */

import React from "react";
import {
  Box,
  Button,
  Divider,
  LinearProgress,
  withStyles,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Link as LinkDom } from "react-router-dom";

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5,
    margin: "8px 0px",
  },
  colorPrimary: {
    backgroundColor:
      theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main,
  },
}))(LinearProgress);

const EmailUsageStatistic: React.FC<any> = () => {
  const { t } = useTranslation();

  return (
    <Box>
      {/*<Divider variant={"middle"} />
      <Box p={2} pb={1}>
        <Box>
          <span>{t("sidebar:usage.campaign")}</span>
          <BorderLinearProgress variant="determinate" value={50} />
          <span>
            {t("sidebar:usage.used_limit", {
              used: "3.521",
              limit: "5.000",
            })}
          </span>
        </Box>

        <Box mt={2}>
          <span>{t("sidebar:usage.transaction")}</span>
          <BorderLinearProgress variant="determinate" value={30} />
          <span>
            {t("sidebar:usage.used", {
              used: "521",
            })}
          </span>
        </Box>
      </Box>

      <Box px={1}>
        <Button component={LinkDom} to={"/apps/usage"} color={"primary"}>
          {t("sidebar:usage.see_detail")}
        </Button>
      </Box>*/}
    </Box>
  );
};

export default EmailUsageStatistic;
