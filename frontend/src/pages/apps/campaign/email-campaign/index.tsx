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
import { Alert } from "@material-ui/lab";
import ActionCell from "../../../../components/datatable/ActionCell";
import { DeleteOutlined, EditOutlined } from "@material-ui/icons";
import { useDeleteResource, useIsMounted } from "../../../../utilities/hooks";
import useStyles from "../../audience/style";
import MuiCard from "../../../../components/ui/card/MuiCard";
import AntTabs from "../../../../components/ui/tabs/AntTabs";
import AntTab from "../../../../components/ui/tabs/AntTab";
import EmailCampaignRepository from "../../../../repositories/EmailCampaignRepository";
import _ from "lodash";
import DateTime from "../../../../components/data/DateTime";
import { equalNumberString } from "../../../../utilities/helpers";

const EmailCampaign: React.FC<any> = () => {
  const classes = useStyles();

  const isMounted = useIsMounted();
  const { t } = useTranslation();
  const { tab, setTab } = useQueryTab(3);

  const data: State<any[]> = useState<any[]>([]);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [dataQuery, setDataQuery] = React.useState<any>({
    page: 1,
    per_page: 5,
    status: undefined,
  });

  const { handleDelete } = useDeleteResource(EmailCampaignRepository);

  const columns: MUIDataTableColumn[] = [
    {
      label: t("pages:email_campaign.datatable.columns.name"),
      name: "name",
    },
    {
      label: t("pages:email_campaign.datatable.columns.subject"),
      name: "subject",
    },
    {
      label: t("pages:email_campaign.datatable.columns.from"),
      name: "from",
    },
    {
      label: t("pages:email_campaign.datatable.columns.email_from"),
      name: "email_from",
    },
    {
      label: t("pages:email_campaign.datatable.columns.sent_at"),
      name: "sent_at",
      options: {
        customBodyRender: (value) => <DateTime data={value} />,
      },
    },
    {
      label: t("pages:email_campaign.datatable.columns.updated"),
      name: "updated_at",
      options: {
        customBodyRender: (value) => <DateTime data={value} />,
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
            severity={equalNumberString(value, 1) ? "success" : "warning"}
          >
            <Typography variant={"caption"}>
              {equalNumberString(value, 0) ? t("common:scheduled") : null}
              {equalNumberString(value, 1) ? t("common:completed") : null}
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

              <IconButton
                onClick={() => {
                  handleDelete(value).then(() => loadData());
                }}
              >
                <DeleteOutlined />
              </IconButton>
            </ActionCell>
          );
        },
      },
    },
  ];

  const loadData = useCallback(async (params = dataQuery) => {
    if (isMounted.current) {
      setLoading(true);
    }

    await EmailCampaignRepository.all({
      ...params,
    })
      .then((resp: AxiosResponse<any>) => {
        if (isMounted.current) {
          setLoading(false);
          setTotalData(resp.data.meta.total);
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
      await loadData(dataQuery);
    })();
  }, [loadData, dataQuery, tab]);

  const onChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
    setDataQuery((nodes: any) => ({
      ...nodes,
      status: newValue === 0 ? undefined : newValue - 1,
    }));
  };

  const onTableChange = (action: string, tableState: any) => {
    if (action === "propsUpdate") {
      return;
    }

    const { page, rowsPerPage: per_page, sortOrder } = tableState;
    const { name, columnName, direction: sorted_by } = sortOrder;
    setDataQuery({
      ...dataQuery,
      page: page + 1,
      per_page,
      ...(sortOrder ? { order_by: columnName || name, sorted_by } : {}),
    });
  };

  const onSearchChange = _.debounce(
    (event: any) =>
      setDataQuery({
        ...dataQuery,
        page: 1,
        search: event.target.value || undefined,
      }),
    200
  );

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
            <EmailCampaignStatusTab handleChange={onChangeTab} value={tab} />
          </Box>

          <MuiDatatable
            data={data.value}
            columns={columns}
            loading={loading}
            onTableChange={onTableChange}
            options={{
              count: totalData,
              page: dataQuery.page - 1,
              rowsPerPage: dataQuery.per_page,
            }}
            inputSearch={{ onChange: onSearchChange }}
          />
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
      <AntTab label={t("pages:email_campaign.tab.scheduled")} />
      <AntTab label={t("pages:email_campaign.tab.completed")} />
    </AntTabs>
  );
};

export default EmailCampaign;
