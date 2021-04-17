import React, { useEffect } from "react";
import { Box, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { AxiosResponse } from "axios";
import ContactRepository from "../../../repositories/ContactRepository";
import GroupRepository from "../../../repositories/GroupRepository";

const Dashboard: React.FC<any> = () => {
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      await GroupRepository.all({
        relations: ["contacts"],
      })

        .then((resp: AxiosResponse) => {
          console.log(resp);
        })
        .catch();
    })();
  }, []);

  return (
    <>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography variant={"h5"}>{t("pages:dashboard.title")}</Typography>
      </Box>
    </>
  );
};

export default Dashboard;
