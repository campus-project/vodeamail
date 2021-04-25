import React, {useCallback, useMemo} from "react";
import useStyles from "../analytic/email/style";
import {useDeleteResource, useIsMounted} from "../../../utilities/hooks";
import {useTranslation} from "react-i18next";
import {State, useState} from "@hookstate/core";
import EmailCampaignRepository from "../../../repositories/EmailCampaignRepository";
import {MUIDataTableColumn} from "mui-datatables";
import DateTime from "../../../components/data/DateTime";
import {Alert} from "@material-ui/lab";
import {equalNumberString} from "../../../utilities/helpers";
import {IconButton, Typography} from "@material-ui/core";
import ActionCell from "../../../components/datatable/ActionCell";
import {Link as LinkDom} from "react-router-dom";
import {DeleteOutlined, EditOutlined} from "@material-ui/icons";
import {AxiosResponse} from "axios";
import MuiCard from "../../../components/ui/card/MuiCard";
import MuiCardHead from "../../../components/ui/card/MuiCardHead";
import MuiDatatable from "../../../components/datatable";

const EmailCampaign: React.FC<any> = () => {
    const classes = useStyles();

    const isMounted = useIsMounted();
    const { t } = useTranslation();

    const data: State<any[]> = useState<any[]>([]);
    const [totalData, setTotalData] = React.useState<number>(0);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [dataQuery, setDataQuery] = React.useState<any>({
        page: 1,
        per_page: 5,
        status: undefined,
    });

    const { handleDelete } = useDeleteResource(EmailCampaignRepository);

    const columns: MUIDataTableColumn[] = [
        {
            label: t("pages:email_campaign.datatable.columns.name"),
            name: "name",
        },
        {
            label: t("pages:email_campaign.datatable.columns.sent_at"),
            name: "sent_at",
            options: {
                customBodyRender: (value) => <DateTime data={value} />,
},
},
    {
        label: t("pages:email_campaign.datatable.columns.status"),
            name: "status",
        options: {
        customBodyRender: (value) => (
            <Alert
                className={classes.emailCampaignStatus}
        icon={false}
        severity={equalNumberString(value, 1) ? "success" : "warning"}
    >
        <Typography variant={"caption"}>
            {equalNumberString(value, 0) ? t("common:scheduled") : null}
        {equalNumberString(value, 1) ? t("common:completed") : null}
        </Typography>
        </Alert>
    ),
    },
    },
    {
        label: " ",
            name: "id",
        options: {
        customBodyRender: (value) => {
            return (
                <ActionCell>
                    <IconButton
                        component={LinkDom}
            to={`/apps/campaign/email-campaign/${value}/edit`}
        >
            <EditOutlined />
            </IconButton>

            <IconButton
            onClick={() => {
                handleDelete(value).then(() => loadData());
            }}
        >
            <DeleteOutlined />
            </IconButton>
            </ActionCell>
        );
        },
    },
    },
];

    const loadData = useCallback(async (params = dataQuery) => {
        if (isMounted.current) {
            setLoading(true);
        }

        await EmailCampaignRepository.all({
            ...params,
            using: "builder",
        })
            .then((resp: AxiosResponse<any>) => {
                if (isMounted.current) {
                    setLoading(false);
                    setTotalData(resp.data.meta.total);
                    data.set(resp.data.data);
                }
            })
            .catch((e: any) => {
                if (isMounted.current) {
                    setLoading(false);
                }
            });
    }, []);

    useMemo(() => {
        (async () => {
            await loadData(dataQuery);
        })();
    }, [loadData, dataQuery]);

    const onTableChange = (action: string, tableState: any) => {
        if (action === "propsUpdate") {
            return;
        }

        const { page, rowsPerPage: per_page, sortOrder } = tableState;
        const { name, columnName, direction: sorted_by } = sortOrder;
        setDataQuery({
            ...dataQuery,
            page: page + 1,
            per_page,
            ...(sortOrder ? { order_by: columnName || name, sorted_by } : {}),
        });
    };

    return (
        <MuiCard>
            <MuiCardHead borderless={1}>
        <Typography variant={"h6"}>
            {t("pages:dashboard.section.newest_campaign")}
    </Typography>
    </MuiCardHead>

    <MuiDatatable
    data={data.value}
    columns={columns}
    loading={loading}
    onTableChange={onTableChange}
    options={{
        count: totalData,
            page: dataQuery.page - 1,
            rowsPerPage: dataQuery.per_page,
    }}
    />
    </MuiCard>
);
};