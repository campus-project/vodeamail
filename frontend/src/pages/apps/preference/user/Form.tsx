/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useEffect, useMemo } from "react";
import { Box, Grid, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { NavigateBefore } from "@material-ui/icons";
import { useNavigate, useParams } from "react-router";
import MuiButtonIconRounded from "../../../../components/ui/button/MuiButtonIconRounded";
import MuiCard from "../../../../components/ui/card/MuiCard";
import MuiCardHead from "../../../../components/ui/card/MuiCardHead";
import MuiCardBody from "../../../../components/ui/card/MuiCardBody";
import MuiTextField from "../../../../components/ui/form/MuiTextField";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormAction from "../../../../components/ui/form/MuiFormAction";
import _ from "lodash";
import UserRepository from "../../../../repositories/UserRepository";
import { useIsMounted } from "../../../../utilities/hooks";
import {
  axiosErrorLoadDataHandler,
  axiosErrorSaveHandler,
} from "../../../../utilities/helpers";
import { useSnackbar } from "notistack";
import { User } from "../../../../models";
import { AxiosResponse } from "axios";
import { Resource } from "../../../../contracts";
import Loading from "../../../../components/ui/Loading";
import MuiAutoComplete from "../../../../components/ui/form/MuiAutoComplete";
import RoleRepository from "../../../../repositories/RoleRepository";

const defaultValues: User = {
  name: "",
  email: "",
  role_id: null,
};

const UserForm: React.FC<any> = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = React.useState<User>(defaultValues);
  const [onFetchData, setOnFetchData] = React.useState<boolean>(Boolean(id));
  const [loading, setLoading] = React.useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    if (isMounted.current) {
      setOnFetchData(true);
    }

    await UserRepository.show(id, {
      relations: ["role"],
    })
      .then((resp: AxiosResponse<Resource<User>>) => {
        const { data: user } = resp.data;

        Object.assign(user, {
          role_id: user.role,
        });

        setData(user);

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

  const { handleSubmit, errors, setError, control, reset } = useForm<User>({
    mode: "onChange",
    resolver: yupResolver(
      yup.object().shape({
        role_id: yup.mixed().required(),
      })
    ),
    defaultValues: useMemo(() => {
      (async () => {
        await loadData();
      })();

      return data;
    }, [id, loadData]),
  });

  useEffect(() => {
    reset(data);
  }, [data]);

  const onSubmit = async (formData: User) => {
    setLoading(true);

    formData.role_id = _.get(formData, "role_id.id");

    await UserRepository.update(id, formData)
      .then(() => {
        if (isMounted.current) {
          setLoading(false);
        }

        enqueueSnackbar(
          t(
            id ? "common:successfully_updated" : "common:successfully_created",
            {
              label: t("pages:user.title"),
            }
          ),
          {
            variant: "success",
          }
        );

        navigate("/apps/preference/user");
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
          <MuiButtonIconRounded
            onClick={() => navigate("/apps/preference/user")}
          >
            <NavigateBefore />
          </MuiButtonIconRounded>
        </Box>
        <Typography variant={"h5"}>
          {t(id ? "common:update_label" : "common:create_label", {
            label: t("pages:user.title"),
          })}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item md={8} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MuiCard>
                <MuiCardHead>
                  <Typography variant={"h6"}>
                    {t("pages:user.section.information")}
                  </Typography>
                </MuiCardHead>

                <MuiCardBody>
                  <Box py={1}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Controller
                          control={control}
                          name={"name"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:user.field.name")}
                              error={_.has(errors, "name")}
                              helperText={_.get(errors, "name.message")}
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Controller
                          control={control}
                          name={"email"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:user.field.email")}
                              error={_.has(errors, "email")}
                              helperText={_.get(errors, "email.message")}
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Controller
                          control={control}
                          name={"role_id"}
                          render={({ value, onChange }) => {
                            return (
                              <MuiAutoComplete
                                value={value}
                                repository={RoleRepository}
                                onSelected={(value) => onChange(value)}
                                muiTextField={{
                                  label: t("pages:user.field.role"),
                                }}
                              />
                            );
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </MuiCardBody>
              </MuiCard>
            </Grid>
          </Grid>
        </Grid>

        <Grid item md={8} xs={12}>
          <FormAction
            title={t("common:save_changes")}
            cancel={t("common:cancel")}
            save={t("common:save")}
            onCancel={() => navigate("/apps/preference/user")}
            onSave={handleSubmit(onSubmit)}
            saveDisable={loading}
            saveLoading={loading}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default UserForm;
