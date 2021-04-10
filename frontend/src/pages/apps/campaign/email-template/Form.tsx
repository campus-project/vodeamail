/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useMemo, useRef } from "react";
import EmailEditor from "react-email-editor";
import Component, { UnlayerOptions } from "react-email-editor";
import { Box } from "@material-ui/core";
import useStyles from "./style";
import axios, { AxiosResponse } from "axios";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";
import { Cancel, Save } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { useIsMounted } from "../../../../utilities/hooks";
import { useNavigate, useParams } from "react-router";
import { useSnackbar } from "notistack";
import {
  $cloneState,
  axiosErrorHandler,
  axiosErrorLoadDataHandler,
} from "../../../../utilities/helpers";
import _ from "lodash";
import { EmailTemplate } from "../../../../models/EmailTemplate";

import exampleDesign from "./data/example-design";
import mergeTags from "./data/merge-tags";
import exampleValueTags from "./data/example-value-tags";
import EmailTemplateRepository from "../../../../repositories/EmailTemplateRepository";
import { Resource } from "../../../../contracts";
import Loading from "../../../../components/ui/Loading";
import { useState } from "@hookstate/core";

const defaultValues = {
  name: "test",
  design: JSON.stringify(exampleDesign),
};

const emailEditorOptions: UnlayerOptions = {
  projectId: 8698,
  displayMode: "email",
  mergeTags,
  features: {
    preview: false,
  },
};

const PageEmailEditor: React.FC<any> = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const classes = useStyles();
  const emailEditorRef = useRef(null);

  const data = useState<EmailTemplate>({
    ...defaultValues,
    id,
  });
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
      .then((resp: AxiosResponse<Resource<EmailTemplate>>) => {
        const { data: emailTemplate } = resp.data;

        data.set(emailTemplate);

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

  const exportImage = () => {
    return new Promise((resolve, reject) => {
      const emailEditor = (emailEditorRef.current as unknown) as Component;
      emailEditor.saveDesign(async (design) => {
        const emailData = JSON.stringify({
          displayMode: "email",
          design: design,
          mergeTags: exampleValueTags,
        });

        axios
          .post("https://api.unlayer.com/v2/export/image", emailData, {
            headers: {
              Authorization:
                "Basic QXQ2QTZ3d2haeGZwd2JCdlBONG5sVXN4Vk9PUEZseHk4UTlqUUYzSFd0eEdqWlUzblFSV3FGdjVSMjBJbjY0Zw==",
            },
          })
          .then((resp) => {
            data.set((nodes) => {
              Object.assign(nodes, {
                image_url: resp.data.data.url,
                design: JSON.stringify(design),
              });

              return nodes;
            });

            resolve(resp);
          })
          .catch((err) => reject(err));
      });
    });
  };

  const onLoad = () => {
    if (emailEditorRef.current !== null) {
      const emailEditor = (emailEditorRef.current as unknown) as Component;
      emailEditor.loadDesign(JSON.parse(data.design.value));

      emailEditor.addEventListener("design:loaded", function (data) {
        setShowSpeedDial(true);
      });

      emailEditor.addEventListener(
        "design:updated",
        _.debounce(() => {
          handleSave(true).then();
        }, 2000)
      );
    }
  };

  const handleSave = async (isFromAutoSave = false) => {
    //prevent spam save
    if (loading) {
      return;
    }

    let loadingSaveKey: any = isFromAutoSave
      ? null
      : enqueueSnackbar(`${t("common:please_wait")}...`, {
          variant: "default",
          autoHideDuration: 5000,
          preventDuplicate: true,
        });

    if (isMounted.current) {
      setLoading(true);
    }

    await exportImage().catch((e: any) => {
      if (isMounted.current) {
        setLoading(false);

        if (loadingSaveKey) {
          closeSnackbar(loadingSaveKey);
        }

        axiosErrorHandler(e, enqueueSnackbar, t);
      }

      return;
    });

    const formData = $cloneState(data);

    await (formData.id
      ? EmailTemplateRepository.update(formData.id, formData)
      : EmailTemplateRepository.create(formData)
    )
      .then((resp: AxiosResponse) => {
        if (isMounted.current) {
          setLoading(false);

          if (loadingSaveKey) {
            closeSnackbar(loadingSaveKey);
          }

          data.id.set(resp.data?.data?.id || id);
        }

        const autoSaveNotificationId = enqueueSnackbar(
          t(
            isFromAutoSave
              ? "common:auto_save"
              : "common:successfully_saved_label",
            {
              label: t("pages:email_template.title"),
            }
          ),
          {
            variant: "success",
          }
        );

        setTimeout(() => {
          if (isMounted.current) {
            closeSnackbar(autoSaveNotificationId);

            if (!isFromAutoSave) {
              navigate("/apps/campaign/email-template");
            }
          }
        }, 1000);
      })
      .catch((e: any) => {
        if (isMounted.current) {
          setLoading(false);

          if (loadingSaveKey) {
            closeSnackbar(loadingSaveKey);
          }

          axiosErrorHandler(e, enqueueSnackbar, t);
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
              onClick={() => handleSave()}
              title={<>{t("common:save")}</>}
            />
            <SpeedDialAction
              icon={<Cancel />}
              onClick={() => navigate("/apps/campaign/email-template")}
              title={<>{t("common:cancel_or_back")}</>}
            />
          </SpeedDial>
        </Box>
        <Box className={"container-email-editor"}>
          <EmailEditor
            ref={emailEditorRef}
            onLoad={onLoad}
            options={emailEditorOptions}
            appearance={{
              theme: "dark",
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default PageEmailEditor;
