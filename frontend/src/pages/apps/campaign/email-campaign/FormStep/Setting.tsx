/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import useStyles from "../../../audience/style";
import { MUIDataTableColumn, MUIDataTableOptions } from "mui-datatables";
import { Alert } from "@material-ui/lab";
import {
  Box,
  FormControlLabel,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import Datatable from "../../../../../components/datatable";
import { Group } from "../../../../../models";
import MuiAutoComplete from "../../../../../components/ui/form/MuiAutoComplete";
import GroupRepository from "../../../../../repositories/GroupRepository";
import MuiCard from "../../../../../components/ui/card/MuiCard";
import MuiCardHead from "../../../../../components/ui/card/MuiCardHead";
import MuiCardBody from "../../../../../components/ui/card/MuiCardBody";
import { useState } from "@hookstate/core";
import { Controller, useForm } from "react-hook-form";
import MuiTextField from "../../../../../components/ui/form/MuiTextField";
import _ from "lodash";
import MuiDatePicker from "../../../../../components/ui/form/MuiDatePicker";
import moment from "moment";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { EmailCampaign } from "../../../../../models";
import FormAction from "../../../../../components/ui/form/MuiFormAction";
import MuiTimePicker from "../../../../../components/ui/form/MuiTimePicker";
import { useSelector } from "react-redux";
import { $clone } from "../../../../../utilities/helpers";

export interface EmailCampaignSettingData extends Partial<EmailCampaign> {}

interface FormSettingProps {
  data: EmailCampaignSettingData;
  errors: { [key: string]: any };
  onNext: (data: EmailCampaignSettingData) => void;
}

const FormSetting: React.FC<FormSettingProps> = (props) => {
  const { onNext, errors: feedBackErrors, data } = props;
  const { t } = useTranslation();

  const { emailDomain } = useSelector(({ campaign }: any) => {
    return {
      emailDomain: campaign.email_campaign.email_domain,
    };
  });

  const groups = useState<Group[]>([]);
  const onDeleteGroup = (indexDeleted: number[]) => {
    groups.set((nodes) =>
      nodes.filter((group, index) => !indexDeleted.includes(index))
    );
  };

  const {
    handleSubmit,
    errors,
    control,
    reset,
    watch,
  } = useForm<EmailCampaignSettingData>({
    mode: "onChange",
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required(),
        subject: yup.string().required(),
        from: yup.string().required(),
        email_from: yup
          .string()
          .required()
          .matches(/^[aA-zZ\s]+$/),
        is_directly_scheduled: yup.number().required(),
        send_date_at: yup.mixed().when("is_directly_scheduled", {
          is: 0,
          then: yup.mixed().required(),
        }),
        send_time_at: yup.mixed().when("is_directly_scheduled", {
          is: 0,
          then: yup.mixed().required(),
        }),
      })
    ),
    defaultValues: data,
  });

  useEffect(() => {
    reset(data);
    groups.set(data.groups || []);
  }, [data]);

  const getError = (key: string) =>
    _.get(errors, key) || _.get(feedBackErrors, key);

  const hasError = (key: string) =>
    _.has(errors, key) || _.has(feedBackErrors, key);

  const isDirectlyScheduled = watch("is_directly_scheduled");

  const onSelectedGroup = (group: Group | null) => {
    if (group === null) {
      return false;
    }

    groups.set((nodes) => [group, ...nodes]);
  };

  const onSubmit = (formData: EmailCampaignSettingData) => {
    let sentAt = null;
    if (
      moment(formData.send_date_at).isValid() &&
      moment(formData.send_time_at).isValid()
    ) {
      sentAt = `${moment(formData.send_date_at).format("YYYY-MM-DD")} ${moment(
        formData.send_time_at
      ).format("HH:mm")}`;
    }

    Object.assign(formData, {
      sent_at: sentAt,
      group_ids: groups.value.map((group) => group.id),
      groups: groups.value,
    });

    onNext($clone(formData));
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item md={8} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MuiCard>
                <MuiCardHead>
                  <Typography variant={"h6"}>
                    {t("pages:email_campaign.section.information")}
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
                              label={t("pages:email_campaign.field.name")}
                              error={hasError("name")}
                              helperText={getError("name.message")}
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
                    {t("pages:email_campaign.section.email_setting")}
                  </Typography>
                </MuiCardHead>

                <MuiCardBody>
                  <Box py={1}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Controller
                          control={control}
                          name={"subject"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:email_campaign.field.subject")}
                              error={hasError("subject")}
                              helperText={getError("subject.message")}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Controller
                          control={control}
                          name={"from"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:email_campaign.field.from")}
                              error={hasError("from")}
                              helperText={getError("from.message")}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Controller
                          control={control}
                          name={"email_from"}
                          render={({ ref, ...others }) => (
                            <MuiTextField
                              {...others}
                              inputRef={ref}
                              label={t("pages:email_campaign.field.email_from")}
                              error={hasError("email_from")}
                              helperText={getError("email_from.message")}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="start">
                                    {emailDomain}
                                  </InputAdornment>
                                ),
                              }}
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
                    {t("pages:email_campaign.section.audience")}
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
                    <TableGroup
                      groups={groups.value}
                      onDelete={onDeleteGroup}
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
                {t("pages:email_campaign.section.schedule")}
              </Typography>
            </MuiCardHead>

            <MuiCardBody>
              <Box py={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      control={control}
                      name={"is_directly_scheduled"}
                      defaultValue={data.is_directly_scheduled}
                      render={({ value, onChange, ...others }) => (
                        <RadioGroup
                          {...others}
                          row
                          onChange={(event, newValue: string) =>
                            onChange(parseInt(newValue))
                          }
                          value={value}
                        >
                          <FormControlLabel
                            value={0}
                            control={<Radio color="primary" />}
                            label={t("pages:email_campaign.field.certain_time")}
                            checked={parseInt(value) === 0}
                            labelPlacement="end"
                          />
                          <FormControlLabel
                            value={1}
                            control={<Radio color="primary" />}
                            label={t(
                              "pages:email_campaign.field.send_directly"
                            )}
                            checked={parseInt(value) === 1}
                            labelPlacement="end"
                          />
                        </RadioGroup>
                      )}
                    />

                    {isDirectlyScheduled ? null : (
                      <>
                        <Controller
                          control={control}
                          name={"send_date_at"}
                          defaultValue={data.send_date_at || new Date()}
                          render={({ ref, onChange, ...others }) => (
                            <MuiDatePicker
                              {...others}
                              inputRef={ref}
                              onChange={onChange}
                              margin={"normal"}
                              label={t("pages:email_campaign.field.date")}
                              error={hasError("send_date_at")}
                              helperText={getError("send_date_at.message")}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name={"send_time_at"}
                          defaultValue={data.send_time_at || new Date()}
                          render={({ ref, onChange, ...others }) => (
                            <MuiTimePicker
                              {...others}
                              inputRef={ref}
                              margin={"normal"}
                              onChange={onChange}
                              label={t("pages:email_campaign.field.time")}
                              error={hasError("send_time_at")}
                              helperText={getError("send_time_at.message")}
                            />
                          )}
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </MuiCardBody>
          </MuiCard>
        </Grid>

        <Grid item xs={12}>
          <FormAction
            title={t("common:next")}
            save={t("common:continue")}
            onSave={handleSubmit(onSubmit)}
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
        (state.inputValue ? option.name.indexOf(state.inputValue) : 1) !== -1
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

export default FormSetting;
