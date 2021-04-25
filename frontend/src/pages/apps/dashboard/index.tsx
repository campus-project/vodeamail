/* eslint-disable react-hooks/exhaustive-deps */

import React from "react";
import { Box, Grid, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import CardEmailCampaign from "./CardEmailCampaign";
import CardEmailCampaignChart from "./CardEmailCampaignChart";
import CardEmailCampaignWidget from "./CardEmailCampaignWidget";

const Dashboard: React.FC<any> = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box mb={3} display={"flex"} flexDirection={"row"} alignItems={"center"}>
        <Typography variant={"h5"}>{t("pages:dashboard.title")}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CardEmailCampaignWidget />
            </Grid>

            <Grid item xs={12}>
              <CardEmailCampaignChart />
            </Grid>
          </Grid>
        </Grid>

        <Grid item md={6} xs={12}>
          <CardEmailCampaign />
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
