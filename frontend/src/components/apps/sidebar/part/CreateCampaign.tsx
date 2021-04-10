import React from "react";
import { Box, Button, Link } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Link as LinkDom } from "react-router-dom";
import { setSidebarClose } from "../../../../store/actions/setting";
import { useDispatch, useSelector } from "react-redux";

const CreateCampaign = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { variant, isOpen } = useSelector(({ setting }: any) => {
    return {
      variant: setting.sidebar.variant,
      isOpen: setting.sidebar.isOpen,
    };
  });

  const handleClick = () => {
    if (variant === "temporary" && isOpen) {
      dispatch(setSidebarClose());
    }
  };

  return (
    <Box p={2}>
      <Link
        component={LinkDom}
        to={"/apps/campaign/email-campaign/create"}
        onClick={handleClick}
      >
        <Button fullWidth variant="contained" color={"primary"}>
          {t("common:create_label", { label: t("pages:email_campaign.title") })}
        </Button>
      </Link>
    </Box>
  );
};

export default CreateCampaign;
