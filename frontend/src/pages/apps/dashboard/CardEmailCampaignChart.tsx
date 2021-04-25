/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import { ChartEmailCampaign } from "../../../models";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import moment from "moment";
import MuiCard from "../../../components/ui/card/MuiCard";
import MuiCardHead from "../../../components/ui/card/MuiCardHead";
import { Box, Typography } from "@material-ui/core";
import { Line } from "react-chartjs-2";
import { AxiosResponse } from "axios";
import { Resource } from "../../../contracts";
import { axiosErrorLoadDataHandler } from "../../../utilities/helpers";
import { useIsMounted } from "../../../utilities/hooks";
import { useSnackbar } from "notistack";
import EmailCampaignRepository from "../../../repositories/EmailCampaignRepository";

interface ICardEmailCampaignChart {}

const chartOptions = {
  responsive: true,
  hoverMode: "index",
  stacked: false,
  scales: {
    yAxes: [],
  },
};

const CardEmailCampaignChart: React.FC<ICardEmailCampaignChart> = () => {
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const { enqueueSnackbar } = useSnackbar();

  const { date } = useSelector(({ setting }: any) => {
    return {
      date: setting.format.date,
    };
  });

  const [chartEmailCampaigns, setChartEmailCampaigns] = React.useState<
    ChartEmailCampaign[]
  >([]);

  const [dataSets, setDataSets] = React.useState<{
    labels: string[];
    datasets: any[];
  }>({
    labels: [],
    datasets: [],
  });

  const loadChartEmailCampaigns = useCallback(async () => {
    await EmailCampaignRepository.chart()
      .then((resp: AxiosResponse<Resource<ChartEmailCampaign[]>>) => {
        if (isMounted.current) {
          setChartEmailCampaigns(resp.data.data);
        }
      })
      .catch((e: any) => {
        if (isMounted.current) {
          axiosErrorLoadDataHandler(e, enqueueSnackbar, t);
        }
      });
  }, [false]);

  useMemo(() => {
    loadChartEmailCampaigns().then();
  }, []);

  useMemo(() => {
    const valueLabels = chartEmailCampaigns.length
      ? []
      : [moment().format(date)];

    const valueDataSets: any[] = [
      {
        label: "Delivered",
        data: [],
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgb(75, 192, 192)",
      },
      {
        label: "Opened",
        data: [],
        fill: false,
        backgroundColor: "rgb(54, 162, 235)",
        borderColor: "rgb(54, 162, 235)",
      },
      {
        label: "Engagement",
        data: [],
        fill: false,
        backgroundColor: "rgb(201, 203, 207)",
        borderColor: "rgb(201, 203, 207)",
      },
    ];

    chartEmailCampaigns.forEach((chartDashboardWidget, index) => {
      if (index === 0 && chartEmailCampaigns.length === 1) {
        valueLabels.push(
          moment(chartDashboardWidget.date)
            .startOf("day")
            .subtract(1, "day")
            .format(date)
        );

        valueDataSets[0].data.push(0);
        valueDataSets[1].data.push(0);
        valueDataSets[2].data.push(0);
      }

      valueLabels.push(moment(chartDashboardWidget.date).format(date));
      valueDataSets[0].data.push(chartDashboardWidget.total_delivered);
      valueDataSets[1].data.push(chartDashboardWidget.total_opened);
      valueDataSets[2].data.push(chartDashboardWidget.total_clicked);
    });

    setDataSets({
      labels: valueLabels,
      datasets: valueDataSets,
    });
  }, [chartEmailCampaigns]);

  return (
    <MuiCard>
      <MuiCardHead borderless={1}>
        <Typography variant={"h6"}>
          {t("pages:dashboard.section.performance")}
        </Typography>
      </MuiCardHead>

      <Box px={4} py={1}>
        <Line data={dataSets} options={chartOptions} />
      </Box>
    </MuiCard>
  );
};

export default CardEmailCampaignChart;
