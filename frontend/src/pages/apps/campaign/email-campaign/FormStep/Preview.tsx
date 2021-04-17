/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { EmailCampaign } from "../../../../../models/EmailCampaign";
import { useTranslation } from "react-i18next";
import { Grid, Typography } from "@material-ui/core";
import MuiCard from "../../../../../components/ui/card/MuiCard";
import MuiCardHead from "../../../../../components/ui/card/MuiCardHead";
import MuiCardBody from "../../../../../components/ui/card/MuiCardBody";
import DateTime from "../../../../../components/data/DateTime";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { EmailCampaignSettingData } from "./Setting";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormAction from "../../../../../components/ui/form/MuiFormAction";

export interface EmailCampaignPreviewData extends Partial<EmailCampaign> {}

interface FormPreviewProps {
  data: EmailCampaignPreviewData;
  onPrevious: () => void;
  onNext: (data: EmailCampaignPreviewData) => void;
  loading: boolean;
}

const FormPreview: React.FC<FormPreviewProps> = (props) => {
  const { onPrevious, onNext, data, loading } = props;
  const { t } = useTranslation();

  const { emailDomain } = useSelector(({ campaign }: any) => {
    return {
      emailDomain: campaign.email_campaign.email_domain,
    };
  });

  const { handleSubmit, reset } = useForm<EmailCampaignSettingData>({
    mode: "onChange",
    resolver: yupResolver(yup.object().shape({})),
    defaultValues: data,
  });

  useEffect(() => {
    reset(data);
  }, [data]);

  const getGroupNames = (): string[] => {
    return (data.groups || []).map((group) => group.name);
  };

  const onSubmit = (formData: EmailCampaignPreviewData) => onNext(formData);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item md={8} xs={12}>
          <MuiCard>
            <MuiCardHead>
              <Typography variant={"h6"}>
                {t("pages:email_campaign.section.preview")}
              </Typography>
            </MuiCardHead>

            <MuiCardBody>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: data.email_template_html || "",
                    }}
                  />
                </Grid>
              </Grid>
            </MuiCardBody>
          </MuiCard>
        </Grid>

        <Grid item md={4} xs={12}>
          <MuiCard>
            <MuiCardHead>
              <Typography variant={"h6"}>
                {t("pages:email_campaign.section.summary")}
              </Typography>
            </MuiCardHead>

            <MuiCardBody>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant={"caption"}>
                    {t("pages:email_campaign:field.name")}
                  </Typography>
                  <Typography variant={"subtitle2"}>{data.name}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant={"caption"}>
                    {t("pages:email_campaign:field.subject")}
                  </Typography>
                  <Typography variant={"subtitle2"}>{data.subject}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant={"caption"}>
                    {t("pages:email_campaign:field.email_from")}
                  </Typography>
                  <Typography variant={"subtitle2"}>
                    {data.from} {`(${data.email_from}${emailDomain})`}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant={"caption"}>
                    {t("pages:email_campaign:field.schedule")}
                  </Typography>
                  <Typography variant={"subtitle2"}>
                    {data.is_directly_scheduled ? (
                      <Typography variant={"subtitle2"}>
                        {t("pages:email_campaign.text.send_directly")}
                      </Typography>
                    ) : (
                      <DateTime data={data.sent_at || ""} />
                    )}
                  </Typography>
                </Grid>

                {getGroupNames().length ? (
                  <Grid item xs={12}>
                    <Typography variant={"caption"}>
                      {t("pages:email_campaign:field.group")}
                    </Typography>

                    {getGroupNames().map((name: string, index: number) => (
                      <Typography variant={"subtitle2"} key={index}>
                        {name}
                      </Typography>
                    ))}
                  </Grid>
                ) : null}
              </Grid>
            </MuiCardBody>
          </MuiCard>
        </Grid>

        <Grid item xs={12}>
          <FormAction
            title={t("common:next")}
            cancel={t("common:previous")}
            save={t("common:continue")}
            onCancel={onPrevious}
            onSave={handleSubmit(onSubmit)}
            saveDisable={loading}
            saveLoading={loading}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default FormPreview;
