/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import { Box, Grid, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { NavigateBefore } from "@material-ui/icons";
import { useNavigate, useParams } from "react-router";
import MuiButtonIconRounded from "../../../../components/ui/button/MuiButtonIconRounded";
import { useIsMounted } from "../../../../utilities/hooks";
import { axiosErrorLoadDataHandler } from "../../../../utilities/helpers";
import { useSnackbar } from "notistack";
import { AxiosResponse } from "axios";
import { Resource } from "../../../../contracts";
import Loading from "../../../../components/ui/Loading";
import EmailCampaignRepository from "../../../../repositories/EmailCampaignRepository";
import {
  EmailCampaign,
  Group,
  SummaryEmailCampaignAnalytic,
} from "../../../../models";
import MuiCard from "../../../../components/ui/card/MuiCard";
import MuiCardHead from "../../../../components/ui/card/MuiCardHead";
import NumberSI from "../../../../components/data/NumberSI";
import useStyles from "./style";
import clsx from "clsx";
import Percentage from "../../../../components/data/Percentage";
import MuiDatatable from "../../../../components/datatable";
import { MUIDataTableColumn } from "mui-datatables";
import PercentageDifferent from "../../../../components/data/PercentageDifferent";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import DateTime from "../../../../components/data/DateTime";
import Number from "../../../../components/data/Number";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import moment from "moment";

interface EmailCampaignAnalytic extends Partial<EmailCampaign> {}

const defaultValues: EmailCampaignAnalytic = {
  name: "",
  total_audience: 0,
  total_clicked: 0,
  total_opened: 0,
  total_unsubscribe: 0,
};

const EmailAnalyticDetail: React.FC<any> = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const classes = useStyles();
  const isMounted = useIsMounted();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = React.useState<EmailCampaignAnalytic>(defaultValues);
  const [onFetchData, setOnFetchData] = React.useState<boolean>(Boolean(id));

  const [
    summaryEmailCampaignAnalytics,
    setSummaryEmailCampaignAnalytics,
  ] = React.useState<SummaryEmailCampaignAnalytic[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    if (isMounted.current) {
      setOnFetchData(true);
    }

    await EmailCampaignRepository.show(id, {
      relations: ["groups", "summary_email_campaign_analytics"],
    })
      .then((resp: AxiosResponse<Resource<EmailCampaign>>) => {
        const { data: emailCampaign } = resp.data;

        setData((nodes) => ({
          ...nodes,
          name: emailCampaign.name,
          total_audience: emailCampaign.total_audience,
          total_delivered: emailCampaign.total_delivered,
          total_clicked: emailCampaign.total_clicked,
          total_opened: emailCampaign.total_opened,
          total_unsubscribe: emailCampaign.total_unsubscribe,
          subject: emailCampaign.subject,
          sent_at: emailCampaign.sent_at,
          last_opened: emailCampaign.last_opened,
          last_clicked: emailCampaign.last_clicked,
          avg_open_duration: emailCampaign.avg_open_duration,
        }));

        setGroups(emailCampaign.groups || []);
        setSummaryEmailCampaignAnalytics(
          emailCampaign.summary_email_campaign_analytics || []
        );

        if (isMounted.current) {
          setOnFetchData(false);
        }
      })
      .catch((e: any) => {
        if (isMounted.current) {
          setOnFetchData(false);

          axiosErrorLoadDataHandler(e, enqueueSnackbar, t);
        }
      });
  }, [false]);

  useMemo(() => {
    (async () => {
      loadData().then();
    })();
  }, []);

  return (
    <>
      {onFetchData ? <Loading /> : null}
      <Box
        mb={3}
        display={"flex"}
        flexDirection={"row"}
        alignItems={"center"}
        style={onFetchData ? { display: "none" } : {}}
      >
        <Box mr={1.5}>
          <MuiButtonIconRounded
            onClick={() => navigate("/apps/analytic/email")}
          >
            <NavigateBefore />
          </MuiButtonIconRounded>
        </Box>
        <Typography variant={"h5"}>
          {data.name || t("pages:email_analytic.title")}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box className={classes.cardSummaryContainer}>
                <CardSummary
                  icon={"vicon-people"}
                  title={t("pages:email_analytic.section.delivered")}
                  value={data.total_delivered || 0}
                  percentage={() => (
                    <PercentageDifferent
                      v1={data.total_delivered || 0}
                      v2={data.total_audience || 0}
                    />
                  )}
                />

                <CardSummary
                  icon={"vicon-people"}
                  title={t("pages:email_analytic.section.opened")}
                  value={data.total_opened || 0}
                  percentage={() => (
                    <PercentageDifferent
                      v1={data.total_opened || 0}
                      v2={data.total_audience || 0}
                    />
                  )}
                />

                <CardSummary
                  icon={"vicon-people"}
                  title={t("pages:email_analytic.section.engagement")}
                  value={data.total_clicked || 0}
                  percentage={() => (
                    <PercentageDifferent
                      v1={data.total_clicked || 0}
                      v2={data.total_audience || 0}
                    />
                  )}
                />

                <CardSummary
                  icon={"vicon-people"}
                  title={t("pages:email_analytic.section.unsubscribed")}
                  danger={true}
                  value={data.total_unsubscribe || 0}
                  percentage={() => (
                    <PercentageDifferent
                      v1={data.total_unsubscribe || 0}
                      v2={data.total_audience || 0}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <EmailCampaignAudience
                totalAudience={data.total_audience}
                groups={groups}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <EmailCampaignSummary
                subject={data.subject}
                sentAt={data.sent_at}
                lastOpened={data.last_opened}
                lastClicked={data.last_clicked}
                avgOpenDuration={data.avg_open_duration}
              />
            </Grid>

            <Grid item xs={12}>
              <EmailCampaignPerformance
                summaryEmailCampaignAnalytics={summaryEmailCampaignAnalytics}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

interface ICardSummary {
  icon: string;
  title: string;
  value: number;
  percentage?: (() => React.ReactNode) | number;
  danger?: boolean;
  style?: React.CSSProperties;
}

const CardSummary: React.FC<ICardSummary> = (props) => {
  const { icon, title, value, percentage, danger = false, style = {} } = props;
  const classes = useStyles();

  return (
    <MuiCard
      className={clsx([classes.cardSummaryItem, danger ? "danger" : ""])}
      style={style}
    >
      <Box className={"card-summary-icon-box"}>
        <i className={icon} />
      </Box>
      <Box className={"card-summary-description-box"}>
        <Typography variant={"body2"}>{title}</Typography>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
        >
          <Typography variant={"h6"}>
            <NumberSI data={value} />
          </Typography>
          {percentage === undefined ? null : (
            <Typography variant={"body2"} className={"percentage"}>
              {typeof percentage === "number" ? (
                <Percentage data={percentage} />
              ) : (
                percentage()
              )}
            </Typography>
          )}
        </Box>
      </Box>
    </MuiCard>
  );
};

interface IEmailCampaignSummary {
  subject?: string;
  sentAt?: string;
  lastOpened?: string;
  lastClicked?: string;
  avgOpenDuration?: number;
}

const EmailCampaignSummary: React.FC<IEmailCampaignSummary> = (props) => {
  const { subject, sentAt, lastOpened, lastClicked, avgOpenDuration } = props;
  const { t } = useTranslation();

  return (
    <MuiCard>
      <Box px={2} mb={1}>
        <Typography variant={"h6"}>
          {t("pages:email_analytic.section.summary")}
        </Typography>
      </Box>

      <Table aria-label="summary table">
        <TableBody>
          <TableRow>
            <TableCell align={"left"}>
              <Typography variant={"body2"}>
                {t("pages:email_analytic.section.subject")}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant={"subtitle2"}>{subject || ""}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align={"left"}>
              <Typography variant={"body2"}>
                {t("pages:email_analytic.section.sent_at")}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant={"subtitle2"}>
                {sentAt === undefined ? null : <DateTime data={sentAt} />}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align={"left"}>
              <Typography variant={"body2"}>
                {t("pages:email_analytic.section.last_opened")}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant={"subtitle2"}>
                {lastOpened === undefined ? (
                  "-"
                ) : (
                  <DateTime data={lastOpened} />
                )}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align={"left"}>
              <Typography variant={"body2"}>
                {t("pages:email_analytic.section.last_clicked")}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant={"subtitle2"}>
                {lastClicked === undefined ? (
                  "-"
                ) : (
                  <DateTime data={lastClicked} />
                )}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align={"left"}>
              <Typography variant={"body2"}>
                {t("pages:email_analytic.section.avg_open_duration")}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant={"subtitle2"}>
                {avgOpenDuration === undefined ? (
                  "-"
                ) : (
                  <Number data={avgOpenDuration} suffix={" minute(s)"} />
                )}
                {/*todo: convert minute to duration like 1 day 30minutes with translation*/}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </MuiCard>
  );
};

interface IEmailCampaignPerformance {
  summaryEmailCampaignAnalytics: SummaryEmailCampaignAnalytic[];
}

const EmailCampaignPerformance: React.FC<IEmailCampaignPerformance> = (
  props
) => {
  const { summaryEmailCampaignAnalytics } = props;
  const { t } = useTranslation();

  const options = {
    scales: {
      yAxes: [
        {
          type: "linear",
          display: true,
          position: "left",
          id: "y-axis-1",
        },
        {
          type: "linear",
          display: true,
          position: "right",
          id: "y-axis-2",
          gridLines: {
            drawOnArea: false,
          },
        },
      ],
    },
  };

  const [dataSets, setDataSets] = React.useState<{
    labels: string[];
    datasets: any[];
  }>({
    labels: ["1", "2", "3", "4", "5", "6"],
    datasets: [],
  });

  const { date } = useSelector(({ setting }: any) => {
    return {
      date: setting.format.date,
    };
  });

  useMemo(() => {
    const valueLabels = summaryEmailCampaignAnalytics.length
      ? []
      : [moment().format(date)];

    const valueDataSets: any[] = [
      {
        label: "Open Rate",
        data: [],
        fill: false,
        backgroundColor: "#027d04",
        borderColor: "#5cab5d",
        yAxisID: "y-axis-1",
      },
      {
        label: "Engagement Rate",
        data: [],
        fill: false,
        backgroundColor: "#023E7D",
        borderColor: "#5c83ab",
        yAxisID: "y-axis-2",
      },
    ];

    summaryEmailCampaignAnalytics.forEach(
      (summaryEmailCampaignAnalytic, index) => {
        if (index === 0 && summaryEmailCampaignAnalytics.length === 1) {
          valueLabels.push(
            moment(summaryEmailCampaignAnalytic.date)
              .startOf("day")
              .subtract(1, "day")
              .format(date)
          );

          valueDataSets[0].data.push(0);
          valueDataSets[1].data.push(0);
        }

        valueLabels.push(
          moment(summaryEmailCampaignAnalytic.date).format(date)
        );

        valueDataSets[0].data.push(summaryEmailCampaignAnalytic.opened);
        valueDataSets[1].data.push(summaryEmailCampaignAnalytic.clicked);
      }
    );

    setDataSets({
      labels: valueLabels,
      datasets: valueDataSets,
    });
  }, [summaryEmailCampaignAnalytics]);

  return (
    <MuiCard>
      <MuiCardHead borderless={1}>
        <Typography variant={"h6"}>
          {t("pages:email_analytic.section.performance")}
        </Typography>
      </MuiCardHead>

      <Box px={4} py={1}>
        <Line data={dataSets} options={options} />
      </Box>
    </MuiCard>
  );
};

interface IEmailCampaignAudience {
  totalAudience?: number;
  groups: Group[];
}

const EmailCampaignAudience: React.FC<IEmailCampaignAudience> = (props) => {
  const { totalAudience, groups } = props;
  const { t } = useTranslation();

  const dataTableGroupColumns: MUIDataTableColumn[] = [
    {
      label: t("pages:email_analytic.datatable_group.columns.name"),
      name: "name",
    },
  ];

  return (
    <MuiCard>
      <CardSummary
        icon={"vicon-people"}
        title={t("pages:email_analytic.section.audience")}
        value={totalAudience || 0}
        style={{ boxShadow: "unset", padding: "0px 12px" }}
      />

      <MuiDatatable
        data={groups}
        columns={dataTableGroupColumns}
        disableServerSide={true}
        options={{ rowsPerPage: 5 }}
      />
    </MuiCard>
  );
};

export default EmailAnalyticDetail;
