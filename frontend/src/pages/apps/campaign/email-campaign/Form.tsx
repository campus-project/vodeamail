/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useEffect, useMemo } from "react";
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
import FormPreview, { EmailCampaignPreviewData } from "./FormStep/Preview";
import {
  $clone,
  axiosErrorLoadDataHandler,
  axiosErrorSaveHandler,
} from "../../../../utilities/helpers";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import useStyles from "./style";
import EmailCampaignRepository from "../../../../repositories/EmailCampaignRepository";
import { AxiosResponse } from "axios";
import { Resource } from "../../../../contracts";
import {
  loadEmailTemplates,
  setEmailCampaignTemplate,
} from "../../../../store/actions";
import { useDispatch, useSelector } from "react-redux";

const defaultValues: EmailCampaign = {
  name: "",
  subject: "",
  from: "",
  email_from: "",
  email_template_id: "",
  email_template_html: "",
  sent_at: "",
  send_date_at: new Date(),
  send_time_at: new Date(),
  is_directly_scheduled: 0,
  status: 1,
  group_ids: [],
};

const CampaignForm: React.FC<any> = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const classes = useStyles();
  const isMounted = useIsMounted();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();
  const { emailDomain } = useSelector(({ campaign }: any) => {
    return {
      emailDomain: campaign.email_campaign.email_domain,
    };
  });

  const [step, setStep] = React.useState(0);
  const steps = [
    t("pages:email_campaign.step.setting"),
    t("pages:email_campaign.step.design"),
    t("pages:email_campaign.step.preview"),
  ];

  const [data, setData] = React.useState<EmailCampaign>(defaultValues);
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
      relations: ["email_template", "groups"],
    })
      .then((resp: AxiosResponse<Resource<EmailCampaign>>) => {
        const { data: emailCampaign } = resp.data;

        setData(() => ({
          ...emailCampaign,
          email_from: emailCampaign.email_from.split("@")[0],
          send_date_at: emailCampaign.sent_at,
          send_time_at: emailCampaign.sent_at,
        }));

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

  useEffect(() => {
    dispatch(loadEmailTemplates());

    return () => {
      dispatch(setEmailCampaignTemplate([]));
    };
  }, []);

  const onNextSetting = (emailCampaignSetting: EmailCampaignSettingData) => {
    setData((nodes) => ({
      ...nodes,
      ...emailCampaignSetting,
    }));
    setStep(1);
  };

  const onNextDesign = (emailCampaignDesign: EmailCampaignDesignData) => {
    setData((nodes) => ({
      ...nodes,
      ...emailCampaignDesign,
    }));
    setStep(2);
  };

  const onSubmitPreview = (emailCampaignPreview: EmailCampaignPreviewData) => {
    setData((nodes) => ({
      ...nodes,
      ...emailCampaignPreview,
    }));

    onSubmit().then(() => {});
  };

  const onSubmit = async () => {
    setLoading(true);

    const formData = $clone(data);

    Object.assign(formData, {
      email_from: `${formData.email_from}${emailDomain}`,
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
              <Grid item md={4} xs={12}>
                <Stepper
                  activeStep={step}
                  className={classes.campaignStepperContainer}
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
          <Box style={step === 0 ? {} : { display: "none" }}>
            <FormSetting data={data} errors={errors} onNext={onNextSetting} />
          </Box>

          <Box style={step === 1 ? {} : { display: "none" }}>
            <FormDesign
              data={data}
              errors={errors}
              onPrevious={() => setStep(0)}
              onNext={onNextDesign}
            />
          </Box>

          <Box style={step === 2 ? {} : { display: "none" }}>
            <FormPreview
              data={data}
              onPrevious={() => setStep(1)}
              onNext={onSubmitPreview}
              loading={loading}
            />
          </Box>
        </Grid>
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
