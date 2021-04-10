/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import { Box, Button, IconButton, Typography } from "@material-ui/core";
import { Link as LinkDom } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MuiDatatable from "../../../../components/datatable";
import EmailTemplateRepository from "../../../../repositories/EmailTemplateRepository";
import { AxiosResponse } from "axios";
import { State, useState } from "@hookstate/core";
import { MUIDataTableColumn } from "mui-datatables";
import DateTimeCell from "../../../../components/datatable/DateTimeCell";
import ActionCell from "../../../../components/datatable/ActionCell";
import { EditOutlined } from "@material-ui/icons";
import { useIsMounted } from "../../../../utilities/hooks";
import MuiCard from "../../../../components/ui/card/MuiCard";

const EmailTemplate: React.FC<any> = () => {
  const isMounted = useIsMounted();
  const { t } = useTranslation();

  const data: State<any[]> = useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const columns: MUIDataTableColumn[] = [
    {
      label: t("pages:email_template.datatable.columns.name"),
      name: "name",
    },
    {
      label: t("pages:email_template.datatable.columns.updated"),
      name: "updated_at",
      options: {
        customBodyRender: (value) => <DateTimeCell data={value} />,
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

    await EmailTemplateRepository.all()
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
          <MuiDatatable data={data.value} columns={columns} loading={loading} />
        </MuiCard>
      </Box>
    </>
  );
};

export default EmailTemplate;
