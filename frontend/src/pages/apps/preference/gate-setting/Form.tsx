/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@material-ui/core";
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
import GateSettingRepository from "../../../../repositories/GateSettingRepository";
import { useIsMounted } from "../../../../utilities/hooks";
import {
  axiosErrorLoadDataHandler,
  axiosErrorSaveHandler,
} from "../../../../utilities/helpers";
import { useSnackbar } from "notistack";
import { GateSetting, Permission, Transaction } from "../../../../models";
import { AxiosResponse } from "axios";
import { Resource } from "../../../../contracts";
import Loading from "../../../../components/ui/Loading";
import MuiAutoComplete from "../../../../components/ui/form/MuiAutoComplete";
import RoleRepository from "../../../../repositories/RoleRepository";
import { useState } from "@hookstate/core";
import TransactionRepository from "../../../../repositories/TransactionRepository";
import { Autocomplete, Skeleton } from "@material-ui/lab";
import moment from "moment";
import MuiDatePicker from "../../../../components/ui/form/MuiDatePicker";

const defaultValues: GateSetting = {
  name: "",
  valid_from: new Date(),
  role_id: null,
  permission_ids: [],
};

interface IPermissionAbility {
  [key: string]: Permission[];
}

const GateSettingForm: React.FC<any> = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const transactionPermission = useState<IPermissionAbility>({});
  const defaultTransactionPermission = useState<IPermissionAbility>({});
  const [data, setData] = React.useState<GateSetting>(defaultValues);
  const [onFetchData, setOnFetchData] = React.useState<boolean>(Boolean(id));
  const [loading, setLoading] = React.useState<boolean>(false);

  const [onLoadTransaction, setOnLoadTransaction] = React.useState<boolean>(
    true
  );
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  const loadTransaction = useCallback(async () => {
    if (isMounted.current) {
      setOnLoadTransaction(true);
    }

    await TransactionRepository.all({
      order_by: "transactions.name",
      relations: ["permissions"],
    })
      .then((resp: AxiosResponse<Resource<Transaction[]>>) => {
        const { data } = resp.data;

        setTransactions(data);

        if (isMounted.current) {
          setOnLoadTransaction(false);
        }
      })
      .catch((e: any) => {
        if (isMounted.current) {
          setOnLoadTransaction(false);

          axiosErrorLoadDataHandler(e, enqueueSnackbar, t);
        }
      });
  }, [false]);

  const loadData = useCallback(async () => {
    if (!id) {
      await loadTransaction().then();
      return;
    }

    if (isMounted.current) {
      setOnFetchData(true);
    }

    await GateSettingRepository.show(id, {
      relations: ["role", "permissions"],
    })
      .then((resp: AxiosResponse<Resource<GateSetting>>) => {
        const { data: gateSetting } = resp.data;

        if (gateSetting.permissions !== undefined) {
          const selectedPermissionAbility: IPermissionAbility = {};

          gateSetting.permissions.forEach((permission) => {
            if (permission.id !== undefined) {
              if (
                typeof selectedPermissionAbility[permission.transaction_id] ===
                "undefined"
              ) {
                selectedPermissionAbility[permission.transaction_id] = [];
              }

              selectedPermissionAbility[permission.transaction_id].push(
                permission
              );
            }
          });

          transactionPermission.set(selectedPermissionAbility);
          defaultTransactionPermission.set(selectedPermissionAbility);
        }

        Object.assign(gateSetting, {
          role_id: gateSetting.role,
        });

        setData(gateSetting);

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

    await loadTransaction().then();
  }, [false]);

  const {
    handleSubmit,
    errors,
    setError,
    control,
    reset,
  } = useForm<GateSetting>({
    mode: "onChange",
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required(),
        valid_from: yup.mixed().required(),
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

  const onSubmit = async (formData: GateSetting) => {
    setLoading(true);

    const permissionIds: string[] = [];

    Object.values(transactionPermission.value).forEach((permissions) => {
      const selectedPermissionIds: string[] = [];
      permissions.forEach((permission) => {
        if (permission.id !== undefined) {
          selectedPermissionIds.push(permission.id);
        }
      });

      permissionIds.push(...selectedPermissionIds);
    });

    formData.valid_from = moment(formData.valid_from).isValid()
      ? moment(formData.valid_from).format()
      : "";
    formData.role_id = _.get(formData, "role_id.id");
    formData.permission_ids = permissionIds;

    await (id
      ? GateSettingRepository.update(id, formData)
      : GateSettingRepository.create(formData)
    )
      .then(() => {
        if (isMounted.current) {
          setLoading(false);
        }

        enqueueSnackbar(
          t(
            id ? "common:successfully_updated" : "common:successfully_created",
            {
              label: t("pages:gate_setting.title"),
            }
          ),
          {
            variant: "success",
          }
        );

        navigate("/apps/preference/gate-setting");
      })
      .catch((e: any) => {
        if (isMounted.current) {
          setLoading(false);

          axiosErrorSaveHandler(e, setError, enqueueSnackbar, t);
        }
      });
  };

  const handleChangePermission = (
    transactionId: string,
    permissions: Permission[]
  ) => {
    transactionPermission.set((nodes) => ({
      ...nodes,
      [transactionId]: permissions,
    }));
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
            onClick={() => navigate("/apps/preference/gate-setting")}
          >
            <NavigateBefore />
          </MuiButtonIconRounded>
        </Box>
        <Typography variant={"h5"}>
          {t(id ? "common:update_label" : "common:create_label", {
            label: t("pages:gate_setting.title"),
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
                    {t("pages:gate_setting.section.information")}
                  </Typography>
                </MuiCardHead>

                <MuiCardBody>
                  <Box py={1}>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Controller
                          control={control}
                          name={"name"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:gate_setting.field.name")}
                              error={_.has(errors, "name")}
                              helperText={_.get(errors, "name.message")}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <Controller
                          control={control}
                          name={"valid_from"}
                          defaultValue={data.valid_from || new Date()}
                          render={({ ref, onChange, ...others }) => (
                            <MuiDatePicker
                              {...others}
                              inputRef={ref}
                              onChange={onChange}
                              label={t("pages:gate_setting.field.valid_from")}
                              error={_.has(errors, "valid_from")}
                              helperText={_.get(errors, "valid_from.message")}
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

            <Grid item xs={12}>
              <MuiCard>
                <MuiCardHead>
                  <Typography variant={"h6"}>
                    {t("pages:gate_setting.section.permission")}
                  </Typography>
                </MuiCardHead>

                <MuiCardBody>
                  <Box py={1}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        {onLoadTransaction ? (
                          <PermissionLoaderSkeleton />
                        ) : (
                          <Table>
                            <TableBody>
                              {transactions.map((transaction) => {
                                const options =
                                  transaction.permissions === undefined
                                    ? []
                                    : _.orderBy(
                                        transaction.permissions,
                                        ["ability"],
                                        ["asc"]
                                      );

                                const defaultValue =
                                  transaction.id === undefined
                                    ? []
                                    : defaultTransactionPermission[
                                        transaction.id
                                      ].value || [];

                                return (
                                  <TableRow key={transaction.id}>
                                    <TableCell width={200}>
                                      <Typography>
                                        {transaction.name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Autocomplete
                                        defaultValue={defaultValue}
                                        options={options}
                                        getOptionLabel={(option) =>
                                          _.get(option, "ability")
                                        }
                                        getOptionSelected={(option, value) =>
                                          _.get(option, "id") ===
                                          _.get(value, "id")
                                        }
                                        multiple
                                        disableCloseOnSelect
                                        onChange={(event, value) =>
                                          handleChangePermission(
                                            _.get(transaction, "id", ""),
                                            value
                                          )
                                        }
                                        renderInput={(params) => (
                                          <MuiTextField
                                            {...params}
                                            label={t(
                                              "pages:gate_setting.field.ability"
                                            )}
                                          />
                                        )}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
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
            onCancel={() => navigate("/apps/preference/gate-setting")}
            onSave={handleSubmit(onSubmit)}
            saveDisable={loading}
            saveLoading={loading}
          />
        </Grid>
      </Grid>
    </>
  );
};

const PermissionLoaderSkeleton = () => {
  return (
    <Box display={"flex"} flexDirection={"column"}>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Skeleton height={56} style={{ width: "35%" }} />
        <Skeleton height={56} style={{ width: "60%" }} />
      </Box>

      <Box display={"flex"} justifyContent={"space-between"}>
        <Skeleton height={56} style={{ width: "35%" }} />
        <Skeleton height={56} style={{ width: "60%" }} />
      </Box>

      <Box display={"flex"} justifyContent={"space-between"}>
        <Skeleton height={56} style={{ width: "35%" }} />
        <Skeleton height={56} style={{ width: "60%" }} />
      </Box>
    </Box>
  );
};

export default GateSettingForm;
