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
import useActiveOptions from "../../../../utilities/hooks/useActiveOptions";
import MuiSelect from "../../../../components/ui/form/MuiSelect";
import GroupRepository from "../../../../repositories/GroupRepository";
import { useIsMounted } from "../../../../utilities/hooks";
import { mapHookFormErrors } from "../../../../utilities/helpers";
import { useSnackbar } from "notistack";
import { useState } from "@hookstate/core";
import { createStyles, withStyles } from "@material-ui/core/styles";
import { Contact, Group } from "../../../../models";
import { MUIDataTableColumn, MUIDataTableOptions } from "mui-datatables";
import Datatable from "../../../../components/datatable";
import { Alert } from "@material-ui/lab";
import useStyles from "../style";
import MuiAutoComplete from "../../../../components/ui/form/MuiAutoComplete";
import ContactRepository from "../../../../repositories/ContactRepository";
import { AxiosResponse } from "axios";
import { Resource } from "../../../../contracts";
import Loading from "../../../../components/ui/Loading";

const defaultValues: Group = {
  name: "",
  description: "",
  is_visible: 1,
  contact_ids: [],
};

const GroupForm: React.FC<any> = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const navigate = useNavigate();
  const { activeOptions } = useActiveOptions();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = React.useState<Group>(defaultValues);
  const [onFetchData, setOnFetchData] = React.useState<boolean>(Boolean(id));
  const [loading, setLoading] = React.useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    if (isMounted.current) {
      setOnFetchData(true);
    }

    await GroupRepository.show(id, {
      relations: ["contacts"],
    })
      .then((resp: AxiosResponse<Resource<Group>>) => {
        const { data: group } = resp.data;

        Object.assign(group, {
          description: group.description === null ? "" : group.description,
        });

        contacts.set(group.contacts || []);

        setData(group);

        if (isMounted.current) {
          setOnFetchData(false);
        }
      })
      .catch((e: any) => {
        const errorTranslation = e?.response?.status
          ? `common:error.${e.response.status}`
          : "common:error.other";

        enqueueSnackbar(t(errorTranslation), {
          variant: "error",
        });

        if (isMounted.current) {
          setOnFetchData(false);
        }
      });
  }, [false]);

  const contacts = useState<Contact[]>(defaultValues.contact_ids);
  const { handleSubmit, errors, setError, control, reset } = useForm<Group>({
    mode: "onChange",
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required(),
        description: yup.string().nullable(true),
        is_visible: yup.boolean().nullable(true),
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

  const onDeleteContact = (indexDeleted: number[]) => {
    contacts.set((nodes) =>
      nodes.filter((contact, index) => !indexDeleted.includes(index))
    );
  };

  const onSelectedContact = (contact: Contact | null) => {
    if (contact === null) {
      return false;
    }

    contacts.set((nodes) => [contact, ...nodes]);
  };

  const onSubmit = async (formData: Group) => {
    setLoading(true);

    Object.assign(formData, {
      contact_ids: contacts.value.map((a) => a.id),
    });

    await (id
      ? GroupRepository.update(id, formData)
      : GroupRepository.create(formData)
    )
      .then(() => {
        if (isMounted.current) {
          setLoading(false);
        }

        enqueueSnackbar(
          t("common:successfully_created", {
            label: t("pages:group.title"),
          }),
          {
            variant: "success",
          }
        );

        navigate("/apps/audience?tab=1");
      })
      .catch((e: any) => {
        if (isMounted.current) {
          setLoading(false);

          if (e?.response?.data?.errors) {
            const errors = mapHookFormErrors(e.response.data.errors);
            Object.keys(errors).forEach((key: any) =>
              setError(key, errors[key])
            );
          } else {
            const errorTranslation = e?.response?.status
              ? `common:error.${e.response.status}`
              : "common:error.other";

            enqueueSnackbar(t(errorTranslation), {
              variant: "error",
            });
          }
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
            onClick={() => navigate("/apps/audience?tab=1")}
          >
            <NavigateBefore />
          </MuiButtonIconRounded>
        </Box>
        <Typography variant={"h5"}>
          {t("common:create_label", {
            label: t("pages:group.title"),
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
                    {t("pages:group.section.information")}
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
                              label={t("pages:group.field.name")}
                              error={_.has(errors, "name")}
                              helperText={_.get(errors, "name.message")}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Controller
                          control={control}
                          name={"description"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:group.field.description")}
                              error={_.has(errors, "description")}
                              helperText={_.get(errors, "description.message")}
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
                    {t("pages:group.section.contact")}
                  </Typography>
                </MuiCardHead>

                <MuiCardBody>
                  <SearchContact
                    selectedIds={
                      contacts.value
                        .map((node) => node.id)
                        .filter((node) => node !== undefined) as string[]
                    }
                    onSelected={onSelectedContact}
                  />

                  <Box mt={2}>
                    <TableContact
                      contacts={contacts.value}
                      onDelete={onDeleteContact}
                    />
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
                {t("pages:group.section.visibility")}
              </Typography>
            </MuiCardHead>

            <MuiCardBody>
              <Controller
                name={"is_visible"}
                control={control}
                defaultValue={defaultValues.is_visible}
                render={({ value, name, onChange }) => (
                  <MuiSelect
                    name={name}
                    value={value}
                    onChange={(event, value) => onChange(value)}
                    options={activeOptions}
                  />
                )}
              />
            </MuiCardBody>
          </MuiCard>
        </Grid>

        <Grid item md={8} xs={12}>
          <FormAction
            title={t("common:save_changes")}
            cancel={t("common:cancel")}
            save={t("common:save")}
            onCancel={() => navigate("/apps/audience?tab=1")}
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
  contacts: any[];
  onDelete: (indexDeleted: number[]) => void;
}

const TableContact = withStyles(() =>
  createStyles({
    overrides: {
      MuiTableCell: {
        body: {
          borderBottom: "unset !important",
        },
      },
    },
  })
)(({ contacts, onDelete }: TableContactProps) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const columns: MUIDataTableColumn[] = [
    {
      label: t("pages:group.field.contact_email"),
      name: "email",
    },
    {
      label: t("pages:group.field.contact_status"),
      name: "is_subscribed",
      options: {
        customBodyRender: (value) => {
          return (
            <Alert
              className={classes.status}
              icon={false}
              severity={value ? "success" : "error"}
            >
              <Typography variant={"caption"}>
                {value ? t("common:subscribed") : t("common:not_subscribed")}
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
      data={contacts}
      columns={columns}
      options={options}
      selectableRows={"multiple"}
    />
  );
});

interface ISearchContact {
  selectedIds: string[];
  onSelected: (contact: Contact) => void;
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
        (state.inputValue ? option.email.search(state.inputValue) : 1) !== -1
    );

  return (
    <MuiAutoComplete
      repository={ContactRepository}
      onSelected={onSelected}
      filterOptions={filterOptions}
      disableCloseOnSelect={true}
      optionLabel={"email"}
      isKeepClear={true}
      muiTextField={{
        label: t("pages:group.field.contact_email"),
      }}
    />
  );
};

export default GroupForm;
