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
import ContactRepository from "../../../../repositories/ContactRepository";
import { useIsMounted } from "../../../../utilities/hooks";
import {
  axiosErrorLoadDataHandler,
  axiosErrorSaveHandler,
} from "../../../../utilities/helpers";
import { useSnackbar } from "notistack";
import { useState } from "@hookstate/core";
import { createStyles, withStyles } from "@material-ui/core/styles";
import { Contact, Group } from "../../../../models";
import { MUIDataTableColumn, MUIDataTableOptions } from "mui-datatables";
import Datatable from "../../../../components/datatable";
import { Alert } from "@material-ui/lab";
import useStyles from "../style";
import MuiAutoComplete from "../../../../components/ui/form/MuiAutoComplete";
import { AxiosResponse } from "axios";
import { Resource } from "../../../../contracts";
import Loading from "../../../../components/ui/Loading";
import GroupRepository from "../../../../repositories/GroupRepository";

const defaultValues: Contact = {
  email: "",
  name: "",
  mobile_phone: "",
  address_line_1: "",
  address_line_2: "",
  country: "",
  province: "",
  city: "",
  postal_code: "",
  group_ids: [],
};

const ContactForm: React.FC<any> = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = React.useState<Contact>(defaultValues);
  const [onFetchData, setOnFetchData] = React.useState<boolean>(Boolean(id));
  const [loading, setLoading] = React.useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    if (isMounted.current) {
      setOnFetchData(true);
    }

    await ContactRepository.show(id, {
      relations: ["groups"],
    })
      .then((resp: AxiosResponse<Resource<Contact>>) => {
        const { data: contact } = resp.data;

        Object.assign(contact, {
          name: contact.name || "",
          mobile_phone: contact.mobile_phone || "",
          address_line_1: contact.address_line_1 || "",
          address_line_2: contact.address_line_2 || "",
          country: contact.country || "",
          province: contact.province || "",
          city: contact.city || "",
          postal_code: contact.postal_code || "",
        });

        groups.set(contact.groups || []);

        setData(contact);

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

  const groups = useState<Group[]>([]);
  const { handleSubmit, errors, setError, control, reset } = useForm<Contact>({
    mode: "onChange",
    resolver: yupResolver(
      yup.object().shape({
        email: yup.string().email().required(),
        name: yup.string().nullable(true),
        mobile_phone: yup.string().nullable(true),
        address_line_1: yup.string().nullable(true),
        address_line_2: yup.string().nullable(true),
        country: yup.string().nullable(true),
        province: yup.string().nullable(true),
        city: yup.string().nullable(true),
        postal_code: yup.string().nullable(true),
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

  const onDeleteGroup = (indexDeleted: number[]) => {
    groups.set((nodes) =>
      nodes.filter((group, index) => !indexDeleted.includes(index))
    );
  };

  const onSelectedGroup = (group: Group | null) => {
    if (group === null) {
      return false;
    }

    groups.set((nodes) => [group, ...nodes]);
  };

  const onSubmit = async (formData: Group) => {
    setLoading(true);

    Object.assign(formData, {
      group_ids: groups.value.map((a) => a.id),
    });

    await (id
      ? ContactRepository.update(id, formData)
      : ContactRepository.create(formData)
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

        navigate("/apps/audience?tab=0");
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
            onClick={() => navigate("/apps/audience?tab=0")}
          >
            <NavigateBefore />
          </MuiButtonIconRounded>
        </Box>
        <Typography variant={"h5"}>
          {t(id ? "common:update_label" : "common:create_label", {
            label: t("pages:contact.title"),
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
                    {t("pages:contact.section.information")}
                  </Typography>
                </MuiCardHead>

                <MuiCardBody>
                  <Box py={1}>
                    <Grid container spacing={3}>
                      <Grid item md={6} xs={12}>
                        <Controller
                          control={control}
                          name={"email"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:contact.field.email")}
                              error={_.has(errors, "email")}
                              helperText={_.get(errors, "email.message")}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Controller
                          control={control}
                          name={"name"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:contact.field.name")}
                              error={_.has(errors, "name")}
                              helperText={_.get(errors, "name.message")}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Controller
                          control={control}
                          name={"mobile_phone"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:contact.field.mobile_phone")}
                              error={_.has(errors, "mobile_phone")}
                              helperText={_.get(errors, "mobile_phone.message")}
                            />
                          )}
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
                    {t("pages:contact.section.address")}
                  </Typography>
                </MuiCardHead>

                <MuiCardBody>
                  <Box py={1}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Controller
                          control={control}
                          name={"address_line_1"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:contact.field.address_line_1")}
                              error={_.has(errors, "address_line_1")}
                              helperText={_.get(
                                errors,
                                "address_line_1.message"
                              )}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Controller
                          control={control}
                          name={"address_line_2"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:contact.field.address_line_2")}
                              error={_.has(errors, "address_line_2")}
                              helperText={_.get(
                                errors,
                                "address_line_2.message"
                              )}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Controller
                          control={control}
                          name={"country"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:contact.field.country")}
                              error={_.has(errors, "country")}
                              helperText={_.get(errors, "country.message")}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Controller
                          control={control}
                          name={"province"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:contact.field.province")}
                              error={_.has(errors, "province")}
                              helperText={_.get(errors, "province.message")}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Controller
                          control={control}
                          name={"city"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:contact.field.city")}
                              error={_.has(errors, "city")}
                              helperText={_.get(errors, "city.message")}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Controller
                          control={control}
                          name={"postal_code"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:contact.field.postal_code")}
                              error={_.has(errors, "postal_code")}
                              helperText={_.get(errors, "postal_code.message")}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </MuiCardBody>
              </MuiCard>
            </Grid>
          </Grid>
        </Grid>

        <Grid item md={4} xs={12}>
          <MuiCard>
            <MuiCardHead>
              <Typography variant={"h6"}>
                {t("pages:contact.section.group")}
              </Typography>
            </MuiCardHead>
            <MuiCardBody>
              <SearchContact
                selectedIds={
                  groups.value
                    .map((node) => node.id)
                    .filter((node) => node !== undefined) as string[]
                }
                onSelected={onSelectedGroup}
              />

              <Box mt={2}>
                <TableGroup groups={groups.value} onDelete={onDeleteGroup} />
              </Box>
            </MuiCardBody>
          </MuiCard>
        </Grid>

        <Grid item md={8} xs={12}>
          <FormAction
            title={t("common:save_changes")}
            cancel={t("common:cancel")}
            save={t("common:save")}
            onCancel={() => navigate("/apps/audience?tab=0")}
            onSave={handleSubmit(onSubmit)}
            saveDisable={loading}
            saveLoading={loading}
          />
        </Grid>
      </Grid>
    </>
  );
};

interface TableContactProps {
  groups: any[];
  onDelete: (indexDeleted: number[]) => void;
}

const TableGroup = withStyles(() =>
  createStyles({
    overrides: {
      MuiTableCell: {
        body: {
          borderBottom: "unset !important",
        },
      },
    },
  })
)(({ groups, onDelete }: TableContactProps) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const columns: MUIDataTableColumn[] = [
    {
      label: t("pages:contact.field.group_name"),
      name: "name",
    },
    {
      label: t("pages:contact.field.group_status"),
      name: "is_visible",
      options: {
        customBodyRender: (value) => {
          return (
            <Alert
              className={classes.status}
              icon={false}
              severity={value ? "success" : "error"}
            >
              <Typography variant={"caption"}>
                {value ? t("common:active") : t("common:in_active")}
              </Typography>
            </Alert>
          );
        },
      },
    },
  ];

  const options: MUIDataTableOptions = {
    page: 0,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10, 20, 50],
    print: false,
    viewColumns: false,
    elevation: 0,
    responsive: "simple",
    onRowsDelete: (rowsDeleted) => {
      onDelete(rowsDeleted.data.map((rowDeleted) => rowDeleted.dataIndex));
    },
  };

  return (
    <Datatable
      data={groups}
      columns={columns}
      options={options}
      selectableRows={"multiple"}
    />
  );
});

interface ISearchContact {
  selectedIds: string[];
  onSelected: (group: Group) => void;
}

const SearchContact: React.FC<ISearchContact> = ({
  selectedIds,
  onSelected,
}) => {
  const { t } = useTranslation();

  const filterOptions = (options: any, state: any) =>
    options.filter(
      (option: any) =>
        !selectedIds.includes(option.id) &&
        (state.inputValue ? option.name.search(state.inputValue) : 1) !== -1
    );

  return (
    <MuiAutoComplete
      repository={GroupRepository}
      onSelected={onSelected}
      filterOptions={filterOptions}
      disableCloseOnSelect={true}
      isKeepClear={true}
      muiTextField={{
        label: t("pages:contact.field.group_name"),
      }}
    />
  );
};

export default ContactForm;
