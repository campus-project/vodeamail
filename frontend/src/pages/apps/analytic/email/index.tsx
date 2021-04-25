/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import { Box, IconButton, Typography } from "@material-ui/core";
import { Link as LinkDom } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MuiDatatable from "../../../../components/datatable";
import { AxiosResponse } from "axios";
import { State, useState } from "@hookstate/core";
import { MUIDataTableColumn } from "mui-datatables";
import ActionCell from "../../../../components/datatable/ActionCell";
import { AssessmentOutlined } from "@material-ui/icons";
import { useIsMounted } from "../../../../utilities/hooks";
import MuiCard from "../../../../components/ui/card/MuiCard";
import _ from "lodash";
import DateTime from "../../../../components/data/DateTime";
import EmailCampaignRepository from "../../../../repositories/EmailCampaignRepository";

const EmailAnalytic: React.FC<any> = () => {
  const isMounted = useIsMounted();
  const { t } = useTranslation();

  const data: State<any[]> = useState<any[]>([]);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [dataQuery, setDataQuery] = React.useState<any>({
    page: 1,
    per_page: 5,
  });

  const columns: MUIDataTableColumn[] = [
    {
      label: t("pages:email_analytic.datatable.columns.name"),
      name: "name",
    },
    {
      label: t("pages:email_analytic.datatable.columns.subject"),
      name: "subject",
    },
    {
      label: t("pages:email_analytic.datatable.columns.from"),
      name: "from",
    },
    {
      label: t("pages:email_analytic.datatable.columns.email_from"),
      name: "email_from",
    },
    {
      label: t("pages:email_analytic.datatable.columns.sent_at"),
      name: "sent_at",
      options: {
        customBodyRender: (value) => <DateTime data={value} />,
      },
    },
    {
      label: t("pages:email_analytic.datatable.columns.updated"),
      name: "updated_at",
      options: {
        customBodyRender: (value) => <DateTime data={value} />,
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
                to={`/apps/analytic/email/${value}`}
              >
                <AssessmentOutlined />
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
  }, [loadData, dataQuery]);

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
          {t("pages:email_analytic.title")}
        </Typography>
      </Box>

      <Box pt={2}>
        <MuiCard>
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

export default EmailAnalytic;
