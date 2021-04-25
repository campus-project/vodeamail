import React from "react";
import useStyles from "../analytic/email/style";
import MuiCard from "../../../components/ui/card/MuiCard";
import clsx from "clsx";
import {Box, Typography} from "@material-ui/core";
import NumberSI from "../../../components/data/NumberSI";
import Percentage from "../../../components/data/Percentage";

interface ICardSummary {
    icon: string;
    title: string;
    value: (() => React.ReactNode) | number;
    percentage?: (() => React.ReactNode) | number;
    danger?: boolean;
    style?: React.CSSProperties;
}

const CardSummary: React.FC<ICardSummary> = (props) => {
    const { icon, title, value, percentage, danger = false, style = {} } = props;
    const classes = useStyles();

    return (
        <MuiCard
            className={clsx([classes.cardSummaryItem, danger ? "danger" : ""])}
    style={style}
    >
    <Box className={"card-summary-icon-box"}>
    <i className={icon} />
    </Box>
    <Box className={"card-summary-description-box"}>
    <Typography variant={"body2"}>{title}</Typography>
        <Box
    display={"flex"}
    flexDirection={"row"}
    justifyContent={"space-between"}
    >
    <Typography variant={"h6"}>
        {typeof value === "function" ? value() : <NumberSI data={value} />}
    </Typography>
    {percentage === undefined ? null : (
        <Typography variant={"body2"} className={"percentage"}>
        {typeof percentage === "number" ? (
                <Percentage data={percentage} />
    ) : (
        percentage()
    )}
        </Typography>
    )}
    </Box>
    </Box>
    </MuiCard>
);
};

        export 