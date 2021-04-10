import React, { useEffect } from "react";
import { EmailCampaign } from "../../../../../models/EmailCampaign";
import { useTranslation } from "react-i18next";
import { Grid, Typography } from "@material-ui/core";
import MuiCard from "../../../../../components/ui/card/MuiCard";
import MuiCardHead from "../../../../../components/ui/card/MuiCardHead";
import MuiCardBody from "../../../../../components/ui/card/MuiCardBody";

export interface EmailCampaignPreviewData extends Partial<EmailCampaign> {}

interface FormPreviewProps {
  data: EmailCampaignPreviewData;
}

const FormPreview: React.FC<FormPreviewProps> = (props) => {
  const { data } = props;
  const { t } = useTranslation();

  useEffect(() => {
    // console.info(data);
  }, [data]);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MuiCard>
            <MuiCardHead>
              <Typography variant={"h6"}>
                {t("pages:email_campaign.section.preview")}
              </Typography>
            </MuiCardHead>

            <MuiCardBody>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Accusamus at consequuntur corporis delectus maiores nihil non
                  numquam qui quibusdam reiciendis. Doloremque excepturi facere
                  libero magnam magni nisi quisquam veniam. Voluptatem!
                </Grid>
              </Grid>
            </MuiCardBody>
          </MuiCard>
        </Grid>
      </Grid>
    </>
  );
};

export default FormPreview;
