import React from "react";
import MUIDataTable, {
  MUIDataTableColumn,
  MUIDataTableOptions,
  MUIDataTableProps,
} from "mui-datatables";
import { Box, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import MuiDatatableSearch, { MuiDatatableSearchProps } from "./Search";
import { MuiTextFieldProps } from "../ui/form/MuiTextField";

const defaultMuiDatatableOption = {
  rowsPerPageOptions: [5, 10, 20, 50],
  serverSide: true,
  filter: false,
  print: false,
  download: false,
  search: false,
  viewColumns: false,
  elevation: 0,
};

export interface IMuiDatatable extends Omit<MUIDataTableProps, "title"> {
  data: any[];
  columns: any[];
  title?: string;
  loading?: boolean;
  //input search
  inputSearch?: MuiTextFieldProps & MuiDatatableSearchProps;

  //datatable
  onTableChange?: MUIDataTableOptions["onTableChange"];
  selectableRows?: MUIDataTableOptions["selectableRows"];
}

export interface IMuiDatatableColumn extends MUIDataTableColumn {
  columnName?: string;
}

const MuiDatatable: React.FC<IMuiDatatable> = (props) => {
  const {
    columns,
    data,
    title = "",
    loading = false,
    //search
    inputSearch,

    //datatable
    options,
    onTableChange,
    selectableRows,
    ...other
  } = props;

  const { t } = useTranslation();

  const textLabels = {
    body: {
      toolTip: t("datatable:body.tooltip"),
      columnHeaderTooltip: (column: MUIDataTableColumn) =>
        t("datatable:body.sort_by", { label: column.label }),
      noMatch: (
        <NoMatch loading={loading} label={t("datatable:body.no_match")} />
      ),
    },
    pagination: {
      next: t("datatable:pagination.next"),
      previous: t("datatable:pagination.previous"),
      rowsPerPage: t("datatable:pagination.row_per_page"),
      displayRows: t("datatable:pagination.display_rows"),
    },
    toolbar: {
      search: t("datatable:toolbar.search"),
      downloadCsv: t("datatable:toolbar.download_csv"),
      print: t("datatable:toolbar.print"),
      viewColumns: t("datatable:toolbar.view_columns"),
      filterTable: t("datatable:toolbar.filter_table"),
    },
    filter: {
      all: t("datatable:filter.all"),
      title: t("datatable:filter.title"),
      reset: t("datatable:filter.reset"),
    },
    viewColumns: {
      title: t("datatable:view_columns.title"),
      titleAria: t("datatable:view_columns.title_aria"),
    },
    selectedRows: {
      text: t("datatable:selected_rows.text"),
      delete: t("datatable:selected_rows.delete"),
      deleteAria: t("datatable:selected_rows.delete_aria"),
    },
  };

  const handleTableChange = (action: string, tableState: any) => {
    if (onTableChange !== undefined) {
      if (tableState?.sortOrder?.name) {
        const muiDatatableColumn = columns.find(
          (column) =>
            column.name === tableState?.sortOrder?.name && !!column.columnName
        );
        if (muiDatatableColumn) {
          tableState.sortOrder.columnName = muiDatatableColumn.columnName;
        }
      }

      onTableChange(action, tableState);
    }
  };

  return (
    <>
      {inputSearch ? (
        <Box px={2} pb={2}>
          <Grid container spacing={3} alignItems={"center"}>
            <Grid item md={2} xs={12}>
              <MuiDatatableSearch {...inputSearch} />
            </Grid>
          </Grid>
        </Box>
      ) : null}

      <MUIDataTable
        title={title}
        data={data}
        columns={columns}
        options={{
          ...(options ?? {}),
          ...defaultMuiDatatableOption,
          onTableChange: handleTableChange,
          selectableRows: selectableRows || "none",
          responsive: "simple",
          textLabels,
        }}
        {...other}
      />
    </>
  );
};

interface INoMatch {
  loading: boolean;
  label: string;
}

const NoMatch: React.FC<INoMatch> = ({ label }) => {
  return <Box>{label}</Box>;

  //todo: loading ga fungsi, padahal sudh diset jadi false, tapi tetap jadi loading
  // return (
  //   <Box>
  //     {loading ? <CircularProgress size={30} color={"inherit"} /> : label}
  //   </Box>
  // );
};

export default MuiDatatable;
