/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import { Box, Button, IconButton, Typography } from "@material-ui/core";
import { Link as LinkDom } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MuiDatatable from "../../../../components/datatable";
import EmailTemplateRepository from "../../../../repositories/EmailTemplateRepository";
import { AxiosResponse } from "axios";
import { useState } from "@hookstate/core";
import { MUIDataTableColumn } from "mui-datatables";
import ActionCell from "../../../../components/datatable/ActionCell";
import { DeleteOutlined, EditOutlined } from "@material-ui/icons";
import { useDeleteResource, useIsMounted } from "../../../../utilities/hooks";
import MuiCard from "../../../../components/ui/card/MuiCard";
import _ from "lodash";
import { Group as IGroup } from "../../../../models";
import DateTime from "../../../../components/data/DateTime";

const EmailTemplate: React.FC<any> = () => {
  const isMounted = useIsMounted();
  const { t } = useTranslation();

  const data = useState<IGroup[]>([]);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [dataQuery, setDataQuery] = React.useState<any>({
    page: 1,
    per_page: 5,
  });

  const { handleDelete } = useDeleteResource(EmailTemplateRepository);

  const columns: MUIDataTableColumn[] = [
    {
      label: t("pages:email_template.datatable.columns.name"),
      name: "name",
    },
    {
      label: t("pages:email_template.datatable.columns.updated"),
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
                to={`/apps/campaign/email-template/${value}/edit`}
                onClick={(event: any) => {
                  event.stopPropagation();
                  window.location.href = `/apps/campaign/email-template/${value}/edit`;
                }}
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

    await EmailTemplateRepository.all({
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
          {t("pages:email_template.title")}
        </Typography>

        <Button
          component={LinkDom}
          to={"/apps/campaign/email-template/create"}
          variant={"contained"}
          color={"primary"}
          onClick={(event: any) => {
            event.stopPropagation();
            window.location.href = "/apps/campaign/email-template/create";
          }}
        >
          {t("common:create_label", {
            label: t("pages:email_template.title"),
          })}
        </Button>
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

export default EmailTemplate;
