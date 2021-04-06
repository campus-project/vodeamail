import React from "react";
import { Box, Button, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import TabPanel from "../../../components/ui/tabs/TabPanel";
import Contact from "./contact";
import Group from "./group";
import { Link as LinkDom } from "react-router-dom";
import useQueryTab from "../../../utilities/hooks/useQueryTab";
import MuiTabs from "../../../components/ui/tabs/MuiTabs";

const Audience: React.FC<any> = () => {
  const { t } = useTranslation();
  const { tab, setTab } = useQueryTab();

  const tabs: string[] = [
    t("pages:audience.tab.contact"),
    t("pages:audience.tab.group"),
  ];

  return (
    <>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography variant={"h5"}>{t("pages:audience.title")}</Typography>

        <AudienceCreateButton tab={tab} />
      </Box>

      <MuiTabs
        value={tab}
        name={"campaign"}
        tabs={tabs}
        onChange={(value) => setTab(value)}
      />

      <Box mt={3}>
        <TabPanel value={tab} index={0}>
          <Contact />
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Group />
        </TabPanel>
      </Box>
    </>
  );
};

const AudienceCreateButton: React.FC<any> = ({ tab }) => {
  const { t } = useTranslation();

  return (
    <>
      {tab === 0 ? (
        <Button
          component={LinkDom}
          to={"/apps/audience/contact/create"}
          variant={"contained"}
          color={"primary"}
        >
          {t("common:create_label", {
            label: t("pages:contact.title"),
          })}
        </Button>
      ) : null}

      {tab === 1 ? (
        <Button
          component={LinkDom}
          to={"/apps/audience/group/create"}
          variant={"contained"}
          color={"primary"}
        >
          {t("common:create_label", {
            label: t("pages:group.title"),
          })}
        </Button>
      ) : null}
    </>
  );
};

export default Audience;
