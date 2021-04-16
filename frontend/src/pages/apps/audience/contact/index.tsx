/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import MuiDatatable, {
  IMuiDatatableColumn,
} from "../../../../components/datatable";
import ContactRepository from "../../../../repositories/ContactRepository";
import { AxiosResponse } from "axios";
import MuiCard from "../../../../components/ui/card/MuiCard";
import { useState } from "@hookstate/core";
import { useTranslation } from "react-i18next";
import { IconButton, Typography } from "@material-ui/core";
import { Link as LinkDom } from "react-router-dom";
import { DeleteOutlined, EditOutlined } from "@material-ui/icons";
import ActionCell from "../../../../components/datatable/ActionCell";
import { Alert } from "@material-ui/lab";
import useStyles from "../style";
import { useDeleteResource, useIsMounted } from "../../../../utilities/hooks";
import { Group as IGroup } from "../../../../models/Group";
import _ from "lodash";
import Number from "../../../../components/data/Number";
import DateTime from "../../../../components/data/DateTime";

const Group: React.FC<any> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMounted = useIsMounted();

  const data = useState<IGroup[]>([]);
  const [totalData, setTotalData] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [dataQuery, setDataQuery] = React.useState<any>({
    page: 1,
    per_page: 5,
  });

  const { handleDelete } = useDeleteResource(ContactRepository);

  const columns: IMuiDatatableColumn[] = [
    {
      label: t("pages:contact.datatable.columns.email"),
      name: "email",
    },
    {
      label: t("pages:contact.datatable.columns.total_group"),
      name: "total_group",
      columnName: "summary_contacts.total_group",
      options: {
        customBodyRender: (value) => <Number data={value} />,
      },
    },
    {
      label: t("pages:contact.datatable.columns.updated"),
      name: "updated_at",
      options: {
        customBodyRender: (value) => <DateTime data={value} />,
      },
    },
    {
      label: t("pages:contact.datatable.columns.status"),
      name: "is_subscribed",
      options: {
        customBodyRender: (value) => (
          <Alert
            className={classes.status}
            icon={false}
            severity={value ? "success" : "error"}
          >
            <Typography variant={"caption"}>
              {value ? t("common:subscribed") : t("common:not_subscribed")}
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
                to={`/apps/audience/contact/${value}/edit`}
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

    await ContactRepository.all({
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
  );
};

export default Group;
