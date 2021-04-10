/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import { Box, Button, IconButton, Typography } from "@material-ui/core";
import { Link as LinkDom } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useQueryTab from "../../../../utilities/hooks/useQueryTab";
import MuiDatatable from "../../../../components/datatable";
import { AxiosResponse } from "axios";
import { State, useState } from "@hookstate/core";
import { MUIDataTableColumn } from "mui-datatables";
import DateTimeCell from "../../../../components/datatable/DateTimeCell";
import { Alert } from "@material-ui/lab";
import ActionCell from "../../../../components/datatable/ActionCell";
import { EditOutlined } from "@material-ui/icons";
import { useIsMounted } from "../../../../utilities/hooks";
import useStyles from "../../audience/style";
import MuiCard from "../../../../components/ui/card/MuiCard";
import AntTabs from "../../../../components/ui/tabs/AntTabs";
import AntTab from "../../../../components/ui/tabs/AntTab";
import EmailCampaignRepository from "../../../../repositories/EmailCampaignRepository";

const EmailCampaign: React.FC<any> = () => {
  const classes = useStyles();

  const isMounted = useIsMounted();
  const { t } = useTranslation();
  const { tab, setTab } = useQueryTab();

  const data: State<any[]> = useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const columns: MUIDataTableColumn[] = [
    {
      label: t("pages:email_campaign.datatable.columns.name"),
      name: "name",
    },
    {
      label: t("pages:email_campaign.datatable.columns.sent_at"),
      name: "sent_at",
    },
    {
      label: t("pages:email_campaign.datatable.columns.updated"),
      name: "updated_at",
      options: {
        customBodyRender: (value) => <DateTimeCell data={value} />,
      },
    },
    {
      label: t("pages:email_campaign.datatable.columns.status"),
      name: "status",
      options: {
        customBodyRender: (value) => (
          <Alert
            className={classes.status}
            icon={false}
            severity={value === 3 ? "success" : "warning"}
          >
            <Typography variant={"caption"}>
              {value === 1 ? t("common:draft") : null}
              {value === 2 ? t("common:scheduled") : null}
              {value === 3 ? t("common:completed") : null}
            </Typography>
          </Alert>
        ),
      },
    },
    {
      label: " ",
      name: "id",
      options: {
        customBodyRender: (value) => {
          return (
            <ActionCell>
              <IconButton
                component={LinkDom}
                to={`/apps/campaign/email-campaign/${value}/edit`}
              >
                <EditOutlined />
              </IconButton>
            </ActionCell>
          );
        },
      },
    },
  ];

  const loadData = useCallback(async () => {
    if (isMounted.current) {
      setLoading(true);
    }

    await EmailCampaignRepository.all()
      .then((resp: AxiosResponse<any>) => {
        if (isMounted.current) {
          setLoading(false);
          data.set(resp.data.data);
        }
      })
      .catch((e: any) => {
        if (isMounted.current) {
          setLoading(false);
        }
      });
  }, []);

  useMemo(() => {
    (async () => {
      await loadData();
    })();
  }, [loadData]);

  return (
    <>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography variant={"h5"}>
          {t("pages:email_campaign.title")}
        </Typography>

        <Button
          component={LinkDom}
          to={"/apps/campaign/email-campaign/create"}
          variant={"contained"}
          color={"primary"}
        >
          {t("common:create_label", {
            label: t("pages:email_campaign.title"),
          })}
        </Button>
      </Box>

      <Box pt={2}>
        <MuiCard>
          <Box mb={4}>
            <EmailCampaignStatusTab
              handleChange={(
                event: React.ChangeEvent<{}>,
                newValue: number
              ) => {
                setTab(newValue);
              }}
              value={tab}
            />
          </Box>

          <MuiDatatable data={data.value} columns={columns} loading={loading} />
        </MuiCard>
      </Box>
    </>
  );
};

const EmailCampaignStatusTab: React.FC<any> = ({ value, handleChange }) => {
  const { t } = useTranslation();

  return (
    <AntTabs value={value} onChange={handleChange} aria-label="campaign tab">
      <AntTab label={t("pages:email_campaign.tab.all")} />
      <AntTab label={t("pages:email_campaign.tab.draft")} />
      <AntTab label={t("pages:email_campaign.tab.scheduled")} />
      <AntTab label={t("pages:email_campaign.tab.completed")} />
    </AntTabs>
  );
};

export default EmailCampaign;
