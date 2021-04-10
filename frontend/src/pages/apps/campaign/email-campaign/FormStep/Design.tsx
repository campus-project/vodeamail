/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { EmailCampaign } from "../../../../../models/EmailCampaign";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { EmailCampaignSettingData } from "./Setting";
import _ from "lodash";
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import MuiCard from "../../../../../components/ui/card/MuiCard";
import MuiCardHead from "../../../../../components/ui/card/MuiCardHead";
import MuiCardBody from "../../../../../components/ui/card/MuiCardBody";
import FormAction from "../../../../../components/ui/form/MuiFormAction";
import useStyles from "../style";
import { Alert } from "@material-ui/lab";
import { NavLink } from "react-router-dom";

export interface EmailCampaignDesignData extends Partial<EmailCampaign> {
  send_date_at: string;
  send_time_at: string;
}

interface FormDesignProps {
  data: EmailCampaignDesignData;
  errors: { [key: string]: any };
  onPrevious: () => void;
  onNext: (data: EmailCampaignDesignData) => void;
}

const emailTemplates = [
  {
    id: "ffe2a9e6-a5f7-4fde-8542-9e3da613e033",
    url:
      "https://cdn.dribbble.com/users/530801/screenshots/1991124/attachments/349112/attach_01.png",
  },
  {
    id: "59fb1674-1900-4bcc-9327-ffffd1fc5951",
    url:
      "https://cdn.dribbble.com/users/530801/screenshots/1991124/attachments/349112/attach_01.png",
  },
  {
    id: "842ce40f-5436-43e3-800a-3fb11fe32301",
    url:
      "https://cdn.dribbble.com/users/530801/screenshots/1991124/attachments/349112/attach_01.png",
  },
  {
    id: "cebede06-a019-4eb4-9377-70009998fc7c",
    url:
      "https://cdn.dribbble.com/users/530801/screenshots/1991124/attachments/349112/attach_01.png",
  },
  {
    id: "b3cd67fa-3383-4f8d-bdef-a0b5472e9bd2",
    url:
      "https://cdn.dribbble.com/users/530801/screenshots/1991124/attachments/349112/attach_01.png",
  },
  {
    id: "4273cc70-00e7-48d6-b02e-44789a8047e3",
    url:
      "https://cdn.dribbble.com/users/530801/screenshots/1991124/attachments/349112/attach_01.png",
  },
];

const FormDesign: React.FC<FormDesignProps> = (props) => {
  const { onPrevious, onNext, errors: feedBackErrors, data } = props;
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    handleSubmit,
    errors,
    control,
    reset,
  } = useForm<EmailCampaignSettingData>({
    mode: "onChange",
    resolver: yupResolver(
      yup.object().shape({
        email_template_id: yup.string().required(),
      })
    ),
    defaultValues: data,
  });

  useEffect(() => {
    reset(data);
  }, [data]);

  const getError = (key: string) =>
    _.get(errors, key) || _.get(feedBackErrors, key);

  const hasError = (key: string) =>
    _.has(errors, key) || _.has(feedBackErrors, key);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <MuiCard>
            <MuiCardHead>
              <Typography variant={"h6"}>
                {t("pages:email_campaign.section.design")}
              </Typography>
            </MuiCardHead>

            <MuiCardBody>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {hasError("email_template_id") ? (
                    <Alert severity="error">
                      {getError("email_template_id.message")}
                    </Alert>
                  ) : null}

                  <Controller
                    control={control}
                    name={"email_template_id"}
                    defaultValue={data.email_template_id}
                    render={({ value, onChange, ...others }) => (
                      <RadioGroup
                        {...others}
                        onChange={(event, newValue: string) =>
                          onChange(newValue)
                        }
                        value={value}
                        className={classes.templateItemGroup}
                      >
                        {emailTemplates.map((emailTemplate) => (
                          <FormControlLabel
                            value={emailTemplate.id}
                            control={<Radio color="primary" />}
                            key={emailTemplate.id}
                            checked={value === emailTemplate.id}
                            label={<TemplateItem url={emailTemplate.url} />}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                </Grid>
              </Grid>
            </MuiCardBody>
          </MuiCard>
        </Grid>

        <Grid item md={6} xs={12}>
          <Box className={classes.templateCreate}>
            <Typography variant={"body1"}>
              {t("pages:email_campaign.field.or_create_design")}
            </Typography>
            <Box mt={1}>
              <Button
                variant="contained"
                color={"primary"}
                component={NavLink}
                to={"/apps/campaign/email-template/create"}
                target={"_blank"}
              >
                {t("common:create_label", { label: "Design" })}
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <FormAction
            title={t("common:next")}
            cancel={t("common:previous")}
            save={t("common:continue")}
            onCancel={onPrevious}
            onSave={handleSubmit(onNext)}
          />
        </Grid>
      </Grid>
    </>
  );
};

const TemplateItem: React.FC<any> = ({ url }) => {
  return (
    <Box className={"template-item"}>
      <img src={url} alt="template" />
    </Box>
  );
};

export default FormDesign;
