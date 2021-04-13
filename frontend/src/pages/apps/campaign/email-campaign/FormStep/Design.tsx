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
import { EmailTemplate } from "../../../../../models/EmailTemplate";
import { useSelector } from "react-redux";
import MuiTextField from "../../../../../components/ui/form/MuiTextField";

export interface EmailCampaignDesignData extends Partial<EmailCampaign> {}

interface FormDesignProps {
  data: EmailCampaignDesignData;
  errors: { [key: string]: any };
  onPrevious: () => void;
  onNext: (data: EmailCampaignDesignData) => void;
}

const FormDesign: React.FC<FormDesignProps> = (props) => {
  const { onPrevious, onNext, errors: feedBackErrors, data } = props;
  const { t } = useTranslation();
  const classes = useStyles();

  const [emailTemplateSearch, setEmailTemplateSearch] = React.useState<string>(
    ""
  );
  const { emailTemplates } = useSelector(({ campaign }: any) => {
    return {
      emailTemplates: campaign.email_campaign.email_templates,
    };
  });

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

  const handleChangeEmailTemplateSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmailTemplateSearch(event.target.value);
  };

  const realEmailTemplates = (): EmailTemplate[] => {
    return !emailTemplateSearch
      ? emailTemplates
      : emailTemplates.filter(
          (emailTemplate: EmailTemplate) =>
            emailTemplate.name.indexOf(emailTemplateSearch) !== -1
        );
  };

  const getError = (key: string) =>
    _.get(errors, key) || _.get(feedBackErrors, key);

  const hasError = (key: string) =>
    _.has(errors, key) || _.has(feedBackErrors, key);

  const onSubmit = (formData: EmailCampaignDesignData) => {
    const selectedEmailTemplate = emailTemplates.find(
      (emailTemplate: EmailTemplate) =>
        emailTemplate.id === formData.email_template_id
    );

    Object.assign(formData, {
      email_template_html: selectedEmailTemplate?.html || "",
    });

    onNext(formData);
  };

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
                  <Grid container spacing={3}>
                    {hasError("email_template_id") ? (
                      <Grid item xs={12}>
                        <Alert severity="error">
                          {getError("email_template_id.message")}
                        </Alert>
                      </Grid>
                    ) : null}

                    <Grid item md={4} xs={12}>
                      <Box mb={3}>
                        <MuiTextField
                          value={emailTemplateSearch}
                          onChange={handleChangeEmailTemplateSearch}
                          placeholder={t("common:search")}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <Box className={classes.templateItemGroupContainer}>
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
                          {realEmailTemplates().map(
                            (emailTemplate: EmailTemplate) => (
                              <FormControlLabel
                                value={emailTemplate.id}
                                control={<Radio color="primary" />}
                                key={emailTemplate.id}
                                checked={value === emailTemplate.id}
                                label={
                                  <TemplateItem
                                    name={emailTemplate.name}
                                    url={emailTemplate.image_url}
                                  />
                                }
                              />
                            )
                          )}
                        </RadioGroup>
                      )}
                    />
                  </Box>
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
                to={"/apps/campaign/email-template/create?from=campaign"}
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
            onSave={handleSubmit(onSubmit)}
          />
        </Grid>
      </Grid>
    </>
  );
};

const TemplateItem: React.FC<any> = ({ url, name }) => {
  return (
    <Box className={"template-item"}>
      <Typography className={"name"} variant={"body2"}>
        {name}
      </Typography>
      <img src={url} alt={name} />
    </Box>
  );
};

export default FormDesign;
