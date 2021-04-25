/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import { Box, Button, IconButton, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Link as LinkDom } from "react-router-dom";
import useStyles from "./style";
import { useDeleteResource, useIsMounted } from "../../../../utilities/hooks";
import { useState } from "@hookstate/core";
import { People as IPeople } from "../../../../models";
import UserRepository from "../../../../repositories/UserRepository";
import MuiDatatable, {
  IMuiDatatableColumn,
} from "../../../../components/datatable";
import { Alert } from "@material-ui/lab";
import ActionCell from "../../../../components/datatable/ActionCell";
import { DeleteOutlined, EditOutlined } from "@material-ui/icons";
import { AxiosResponse } from "axios";
import _ from "lodash";
import MuiCard from "../../../../components/ui/card/MuiCard";
import Number from "../../../../components/data/Number";
import DateTime from "../../../../components/data/DateTime";

const People: React.FC<any> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMounted = useIsMounted();

  const data = useState<IPeople[]>([]);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [dataQuery, setDataQuery] = React.useState<any>({
    page: 1,
    per_page: 5,
  });

  const { handleDelete } = useDeleteResource(UserRepository);

  const columns: IMuiDatatableColumn[] = [
    {
      label: t("pages:role.datatable.columns.name"),
      name: "name",
    },
    {
      label: t("pages:role.datatable.columns.total_user"),
      name: "total_user",
      columnName: "summary_roles.total_user",
      options: {
        customBodyRender: (value) => <Number data={value} />,
      },
    },
    {
      label: t("pages:role.datatable.columns.updated"),
      name: "updated_at",
      options: {
        customBodyRender: (value) => <DateTime data={value} />,
      },
    },
    {
      label: t("pages:role.datatable.columns.default"),
      name: "is_default",
      options: {
        customBodyRender: (value) => (
          <Alert
            className={classes.status}
            icon={false}
            severity={value ? "success" : "error"}
          >
            <Typography variant={"caption"}>
              {value ? t("common:active") : t("common:in_active")}
            </Typography>
          </Alert>
        ),
      },
    },
    {
      label: " ",
      name: "id",
      options: {
        customBodyRender: (value, metaData) => {
          const rowData = data[metaData.rowIndex].value;
          const canDelete = data.value.length > 1 && !rowData.is_special;

          return (
            <ActionCell>
              <IconButton
                component={LinkDom}
                to={`/apps/preference/role/${value}/edit`}
              >
                <EditOutlined />
              </IconButton>

              {canDelete ? (
                <IconButton
                  onClick={() => {
                    handleDelete(value).then(() => loadData());
                  }}
                >
                  <DeleteOutlined />
                </IconButton>
              ) : null}
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

    await UserRepository.all({
      ...params,
      using: "builder",
    })
      .then((resp: AxiosResponse<any>) => {
        if (isMounted.current) {
          setLoading(false);
          setTotalData(resp.data.meta.total);
          data.set(resp.data.data);
        }
      })
      .catch(() => {
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
        <Typography variant={"h5"}>{t("pages:role.title")}</Typography>

        <Button
          component={LinkDom}
          to={"/apps/preference/role/create"}
          variant={"contained"}
          color={"primary"}
        >
          {t("common:create_label", {
            label: t("pages:role.title"),
          })}
        </Button>
      </Box>

      <Box mt={3}>
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

export default People;
