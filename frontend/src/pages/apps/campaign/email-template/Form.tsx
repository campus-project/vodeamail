/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import EmailEditor from "react-email-editor";
import Component from "react-email-editor";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import useStyles from "./style";
import axios, { AxiosResponse } from "axios";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";
import { Cancel, Save } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { useIsMounted, useQuerySearch } from "../../../../utilities/hooks";
import { useNavigate, useParams } from "react-router";
import { useSnackbar } from "notistack";
import {
  $cloneState,
  axiosErrorHandler,
  axiosErrorLoadDataHandler,
  axiosErrorSaveHandler,
} from "../../../../utilities/helpers";
import { EmailTemplate } from "../../../../models/EmailTemplate";
import EmailTemplateRepository from "../../../../repositories/EmailTemplateRepository";
import { Resource } from "../../../../contracts";
import Loading from "../../../../components/ui/Loading";

import exampleDesign from "./data/example-design";
import exampleValueTags from "./data/example-value-tags";
import mergeTags from "./data/merge-tags";
import { useState } from "@hookstate/core";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MuiTextField from "../../../../components/ui/form/MuiTextField";
import _ from "lodash";

const defaultValues: EmailTemplate = {
  name: "",
  design: JSON.stringify(exampleDesign),
  html: "",
  example_value_tags: JSON.stringify(exampleValueTags),
  image_url: "",
};

const PageEmailEditor: React.FC<any> = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const classes = useStyles();
  const emailEditorRef = useRef(null);
  const { from = null } = useQuerySearch();

  const data = useState<EmailTemplate>({ ...defaultValues, id });
  const [onFetchData, setOnFetchData] = React.useState<boolean>(Boolean(id));
  const [loading, setLoading] = React.useState<boolean>(false);

  const [showSpeedDial, setShowSpeedDial] = React.useState<boolean>(false);
  const [speedDialOpen, setSpeedDialOpen] = React.useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    if (isMounted.current) {
      setOnFetchData(true);
    }

    await EmailTemplateRepository.show(id)
      .then(async (resp: AxiosResponse<Resource<EmailTemplate>>) => {
        const { data: emailTemplate } = resp.data;

        data.set(emailTemplate);

        reset($cloneState(data));

        if (isMounted.current) {
          setOnFetchData(false);

          setTimeout(() => {
            const emailEditor = (emailEditorRef.current as unknown) as Component;
            if (Boolean(emailTemplate.design)) {
              emailEditor.loadDesign(JSON.parse(emailTemplate.design));
            }
          }, 1000);
        }
      })
      .catch((e: any) => {
        if (isMounted.current) {
          setOnFetchData(false);

          axiosErrorLoadDataHandler(e, enqueueSnackbar, t);
        }
      });
  }, [false]);

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const { handleSubmit, errors, setError, control, reset } = useForm({
    mode: "onChange",
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required(),
      })
    ),
    defaultValues: useMemo(() => {
      (async () => {
        await loadData();
      })();

      return $cloneState(data);
    }, [id, loadData]),
  });

  const onLoadEditor = async () => {
    if (emailEditorRef.current !== null) {
      const emailEditor = (emailEditorRef.current as unknown) as Component;
      emailEditor.addEventListener("design:loaded", () =>
        setShowSpeedDial(true)
      );

      emailEditor.addEventListener("design:updated", () => {
        emailEditor.exportHtml(({ design, html }) => {
          data.set((nodes) => ({
            ...nodes,
            design: JSON.stringify(design),
            html: html,
          }));
        });
      });

      if (Boolean(data.design)) {
        emailEditor.loadDesign(JSON.parse(data.design.value));
      }
    }
  };

  const exportImage = () => {
    return new Promise((resolve, reject) => {
      const emailData = JSON.stringify({
        displayMode: "email",
        design: JSON.parse(data.design.value),
        mergeTags: JSON.parse(data.example_value_tags.value),
      });

      axios
        .post("https://api.unlayer.com/v2/export/image", emailData, {
          headers: {
            Authorization:
              "Basic QXQ2QTZ3d2haeGZwd2JCdlBONG5sVXN4Vk9PUEZseHk4UTlqUUYzSFd0eEdqWlUzblFSV3FGdjVSMjBJbjY0Zw==",
          },
        })
        .then(async (resp) => resolve(resp.data.data.url))
        .catch((err) => reject(err));
    });
  };

  const handleCancelSpeedDial = () => {
    if (from === "campaign") {
      //todo: run reducer to update redux email templates
      window.close();
    } else {
      navigate("/apps/campaign/email-template");
    }
  };

  const onSubmit = async (formData: EmailTemplate) => {
    setLoading(true);

    data.set((nodes) => ({
      ...nodes,
      ...formData,
    }));

    const emailEditor = (emailEditorRef.current as unknown) as Component;
    emailEditor.exportHtml(({ design, html }) => {
      data.set((nodes) => ({
        ...nodes,
        design: JSON.stringify(design),
        html: html,
      }));
    });

    await exportImage()
      .then((url: any) => {
        data.image_url.set(url);
      })
      .catch((e) => {
        if (isMounted.current) {
          setLoading(false);

          axiosErrorHandler(e, enqueueSnackbar, t);
        }
      });

    await (id
      ? EmailTemplateRepository.update(id, $cloneState(data))
      : EmailTemplateRepository.create($cloneState(data))
    )
      .then(() => {
        if (isMounted.current) {
          setLoading(false);
        }

        if (from === "campaign") {
          //todo: run reducer to update redux email templates
          window.close();
        } else {
          navigate("/apps/campaign/email-template");
        }
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
        className={classes.containerEmailWrapper}
        style={onFetchData ? { display: "none" } : {}}
      >
        <Box className={"container-control-button"} p={2}>
          <SpeedDial
            ariaLabel="SpeedDial Email Template"
            icon={<SpeedDialIcon />}
            onClose={() => setSpeedDialOpen(false)}
            onOpen={() => setSpeedDialOpen(true)}
            open={speedDialOpen}
            hidden={!showSpeedDial}
            direction={"up"}
          >
            <SpeedDialAction
              icon={<Save />}
              onClick={() => setDialogOpen(true)}
              title={<>{t("common:save")}</>}
            />
            <SpeedDialAction
              icon={<Cancel />}
              onClick={handleCancelSpeedDial}
              title={<>{t("common:cancel_or_back")}</>}
            />
          </SpeedDial>
        </Box>
        <Box className={"container-email-editor"}>
          <EmailEditor
            ref={emailEditorRef}
            onLoad={onLoadEditor}
            options={{
              projectId: 8698,
              displayMode: "email",
              mergeTags,
              features: {
                preview: false,
              },
            }}
            appearance={{
              theme: "light",
            }}
          />
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-email-template-title">
          {t("pages:email_template.text.dialog_title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("pages:email_template.text.dialog_description")}
          </DialogContentText>
          <Controller
            control={control}
            name={"name"}
            render={({ ref, ...others }) => (
              <MuiTextField
                {...others}
                inputRef={ref}
                label={t("pages:email_template.field.name")}
                error={_.has(errors, "name")}
                helperText={_.get(errors, "name.message")}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Box px={2} py={1}>
            <Button onClick={() => setDialogOpen(false)}>
              {t("common:cancel")}
            </Button>
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress color="inherit" size={20} />
              ) : (
                t("common:save")
              )}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PageEmailEditor;
