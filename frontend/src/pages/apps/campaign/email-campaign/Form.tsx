/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Hidden,
  Step,
  StepConnector,
  StepIconProps,
  StepLabel,
  Stepper,
  Typography,
} from "@material-ui/core";
import MuiButtonIconRounded from "../../../../components/ui/button/MuiButtonIconRounded";
import { NavigateBefore } from "@material-ui/icons";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useIsMounted } from "../../../../utilities/hooks";
import { useSnackbar } from "notistack";
import { EmailCampaign } from "../../../../models/EmailCampaign";
import Loading from "../../../../components/ui/Loading";
import FormSetting, { EmailCampaignSettingData } from "./FormStep/Setting";
import FormDesign, { EmailCampaignDesignData } from "./FormStep/Design";
import FormPreview from "./FormStep/Preview";
import {
  $clone,
  $cloneState,
  axiosErrorLoadDataHandler,
  axiosErrorSaveHandler,
} from "../../../../utilities/helpers";
import { useState } from "@hookstate/core";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import useStyles from "./style";
import EmailCampaignRepository from "../../../../repositories/EmailCampaignRepository";
import { AxiosResponse } from "axios";
import { Resource } from "../../../../contracts";
import FormAction from "../../../../components/ui/form/MuiFormAction";

const defaultValues: EmailCampaign = {
  name: "Campaign Default",
  subject: "Test Subject",
  from: "Vodea",
  email_from: "info@vodea.id",
  email_template_id: "ffe2a9e6-a5f7-4fde-8542-9e3da613e033",
  sent_at: "",
  is_directly_scheduled: 0,
  is_delivered: 0,
  group_ids: [],
};

const CampaignForm: React.FC<any> = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const classes = useStyles();
  const isMounted = useIsMounted();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [step, setStep] = React.useState(0);
  const steps = [
    t("pages:email_campaign.step.setting"),
    t("pages:email_campaign.step.design"),
    t("pages:email_campaign.step.preview"),
  ];

  const data = useState<EmailCampaign>(defaultValues);
  const [onFetchData, setOnFetchData] = React.useState<boolean>(Boolean(id));
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setError] = React.useState<{ [key: string]: any }>({});

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    if (isMounted.current) {
      setOnFetchData(true);
    }

    await EmailCampaignRepository.show(id, {
      relations: ["email_template"],
    })
      .then((resp: AxiosResponse<Resource<EmailCampaign>>) => {
        const { data: emailCampaign } = resp.data;

        data.set(emailCampaign);

        if (isMounted.current) {
          setOnFetchData(false);
        }
      })
      .catch((e: any) => {
        if (isMounted.current) {
          setOnFetchData(false);

          axiosErrorLoadDataHandler(e, enqueueSnackbar, t);
        }
      });
  }, [false]);

  useMemo(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  const onNextSetting = (emailCampaignSetting: EmailCampaignSettingData) => {
    data.set((nodes) => {
      Object.assign(nodes, $clone(emailCampaignSetting));
      return nodes;
    });

    setStep(1);
  };

  const onNextDesign = (emailCampaignDesign: EmailCampaignDesignData) => {
    data.set((nodes) => {
      Object.assign(nodes, $clone(emailCampaignDesign));
      return nodes;
    });

    setStep(2);
  };

  const onSubmit = async (formData: EmailCampaign) => {
    setLoading(true);

    Object.assign(formData, {
      is_directly_scheduled: Boolean(formData.is_directly_scheduled),
    });

    await (id
      ? EmailCampaignRepository.update(id, formData)
      : EmailCampaignRepository.create(formData)
    )
      .then(() => {
        if (isMounted.current) {
          setLoading(false);
        }

        enqueueSnackbar(
          t("common:successfully_created", {
            label: t("pages:contact.title"),
          }),
          {
            variant: "success",
          }
        );

        navigate("/apps/campaign/email-campaign");
      })
      .catch((e: any) => {
        if (isMounted.current) {
          setLoading(false);

          axiosErrorSaveHandler(e, setError, enqueueSnackbar, t);
        }
      });
  };

  return (
    <>
      {onFetchData ? <Loading /> : null}
      <Box
        mb={3}
        display={"flex"}
        flexDirection={"row"}
        alignItems={"center"}
        style={onFetchData ? { display: "none" } : {}}
      >
        <Box mr={1.5}>
          <MuiButtonIconRounded onClick={() => navigate(-1)}>
            <NavigateBefore />
          </MuiButtonIconRounded>
        </Box>
        <Typography variant={"h5"}>
          {t("common:create_label", {
            label: t("pages:email_campaign.title"),
          })}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Hidden smDown>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <Stepper
                  activeStep={step}
                  connector={<CampaignStepIconConnector />}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel
                        StepIconComponent={CampaignStepIcon}
                        className={classes.campaignStepper}
                      >
                        <Typography variant={"subtitle2"}>{label}</Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Grid>
            </Grid>
          </Grid>
        </Hidden>

        <Grid item xs={12}>
          {step === 0 ? (
            <FormSetting
              data={$cloneState(data)}
              errors={errors}
              onNext={onNextSetting}
            />
          ) : null}
          {step === 1 ? (
            <FormDesign
              data={$cloneState(data)}
              errors={errors}
              onPrevious={() => setStep(0)}
              onNext={onNextDesign}
            />
          ) : null}
          {step === 2 ? <FormPreview data={$cloneState(data)} /> : null}
        </Grid>

        {step === steps.length - 1 ? (
          <Grid item xs={12}>
            <FormAction
              title={t("common:save_changes")}
              cancel={t("common:cancel")}
              save={t("common:save")}
              onCancel={() => setStep(1)}
              onSave={() => onSubmit($cloneState(data))}
              saveDisable={loading}
              saveLoading={loading}
            />
          </Grid>
        ) : null}
      </Grid>
    </>
  );
};

const CampaignStepIconConnector = withStyles((theme) => ({
  alternativeLabel: {
    top: 22,
  },
  active: {
    "& $line": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  completed: {
    "& $line": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  line: {
    height: 2,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1,
  },
}))(StepConnector);

const CampaignStepIcon: React.FC<StepIconProps & { icon: any }> = (props) => {
  const icons = ["vicon-new-document", "vicon-design", "vicon-inspection"];

  const { active, completed, icon } = props;
  const classes = useStyles();

  return (
    <i
      className={clsx(`icon ${icons[icon - 1]}`, {
        [classes.campaignStepperActive]: active,
        [classes.campaignStepperCompleted]: completed,
      })}
    />
  );
};

export default CampaignForm;
