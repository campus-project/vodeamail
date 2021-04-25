/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@material-ui/core";
import { AxiosResponse } from "axios";
import { Resource } from "../../../contracts";
import { axiosErrorLoadDataHandler } from "../../../utilities/helpers";
import { useIsMounted } from "../../../utilities/hooks";
import { useSnackbar } from "notistack";
import EmailCampaignRepository from "../../../repositories/EmailCampaignRepository";
import { WidgetEmailCampaign } from "../../../models";
import CardSummary from "./CardSummary";
import PercentageDifferent from "../../../components/data/PercentageDifferent";
import useStyles from "../analytic/email/style";

interface ICardEmailCampaignWidget {}

const defaultDashboardWidget: WidgetEmailCampaign = {
  total_delivered: 0,
  total_opened: 0,
  total_clicked: 0,
  total_active: 0,
};

const CardEmailCampaignChart: React.FC<ICardEmailCampaignWidget> = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const { enqueueSnackbar } = useSnackbar();

  const [
    widgetEmailCampaign,
    setWidgetEmailCampaign,
  ] = React.useState<WidgetEmailCampaign>(defaultDashboardWidget);

  const loadDashboardWidget = useCallback(async () => {
    await EmailCampaignRepository.widget()
      .then((resp: AxiosResponse<Resource<WidgetEmailCampaign>>) => {
        if (isMounted.current) {
          setWidgetEmailCampaign(resp.data.data);
        }
      })
      .catch((e: any) => {
        if (isMounted.current) {
          axiosErrorLoadDataHandler(e, enqueueSnackbar, t);
        }
      });
  }, [false]);

  useMemo(() => {
    loadDashboardWidget().then();
  }, []);

  return (
    <Box className={classes.cardSummaryContainer}>
      <CardSummary
        icon={"vicon-people"}
        title={t("pages:dashboard.section.opened")}
        value={() => (
          <PercentageDifferent
            defaultValue={0}
            v1={widgetEmailCampaign?.total_opened || 0}
            v2={widgetEmailCampaign?.total_delivered || 0}
          />
        )}
      />

      <CardSummary
        icon={"vicon-people"}
        title={t("pages:dashboard.section.engagement")}
        value={() => (
          <PercentageDifferent
            defaultValue={0}
            v1={widgetEmailCampaign?.total_clicked || 0}
            v2={widgetEmailCampaign?.total_delivered || 0}
          />
        )}
      />

      <CardSummary
        icon={"vicon-people"}
        title={t("pages:dashboard.section.active")}
        value={widgetEmailCampaign?.total_active || 0}
      />

      <CardSummary
        icon={"vicon-people"}
        title={t("pages:dashboard.section.delivered")}
        value={widgetEmailCampaign?.total_delivered || 0}
      />
    </Box>
  );
};

export default CardEmailCampaignChart;
