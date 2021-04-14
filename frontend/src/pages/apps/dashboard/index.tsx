import React from "react";
import { Box, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const Dashboard: React.FC<any> = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography variant={"h5"}>{t("pages:dashboard.title")}</Typography>
      </Box>
    </>
  );
};

export default Dashboard;
