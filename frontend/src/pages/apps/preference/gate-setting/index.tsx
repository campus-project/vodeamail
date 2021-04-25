/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import { Box, Button, IconButton, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Link as LinkDom } from "react-router-dom";
import { useDeleteResource, useIsMounted } from "../../../../utilities/hooks";
import { useState } from "@hookstate/core";
import { GateSetting as IGateSetting } from "../../../../models";
import GateSettingRepository from "../../../../repositories/GateSettingRepository";
import MuiDatatable, {
  IMuiDatatableColumn,
} from "../../../../components/datatable";
import ActionCell from "../../../../components/datatable/ActionCell";
import { DeleteOutlined, EditOutlined } from "@material-ui/icons";
import { AxiosResponse } from "axios";
import _ from "lodash";
import MuiCard from "../../../../components/ui/card/MuiCard";
import DateTime from "../../../../components/data/DateTime";

const GateSetting: React.FC<any> = () => {
  const { t } = useTranslation();
  const isMounted = useIsMounted();

  const data = useState<IGateSetting[]>([]);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [dataQuery, setDataQuery] = React.useState<any>({
    page: 1,
    per_page: 5,
  });

  const { handleDelete } = useDeleteResource(GateSettingRepository);

  const columns: IMuiDatatableColumn[] = [
    {
      label: t("pages:gate_setting.datatable.columns.name"),
      name: "name",
    },
    {
      label: t("pages:gate_setting.datatable.columns.updated"),
      name: "updated_at",
      options: {
        customBodyRender: (value) => <DateTime data={value} />,
      },
    },
    {
      label: " ",
      name: "id",
      options: {
        customBodyRender: (value, metaData) => {
          return (
            <ActionCell>
              <IconButton
                component={LinkDom}
                to={`/apps/preference/gate-setting/${value}/edit`}
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

    await GateSettingRepository.all({
      ...params,
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
        <Typography variant={"h5"}>{t("pages:gate_setting.title")}</Typography>

        <Button
          component={LinkDom}
          to={"/apps/preference/gate-setting/create"}
          variant={"contained"}
          color={"primary"}
        >
          {t("common:create_label", {
            label: t("pages:gate_setting.title"),
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

export default GateSetting;
