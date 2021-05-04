import React, { ReactNode } from "react";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import MuiCard, { MuiCardProps } from "../card/MuiCard";
import { Box, Button, CircularProgress, Typography } from "@material-ui/core";

export interface MuiFormActionProps {
  title: string | ReactNode;
  cancel?: string | ReactNode;
  save: string | ReactNode;
  muiCardProps?: MuiCardProps;
  onCancel?: () => void;
  onSave?: () => void;
  saveLoading?: boolean;
  saveDisable?: boolean;
}

const MuiCardBody = withStyles((theme: Theme) =>
  createStyles({
    root: {
      marginBottom: `-${theme.spacing(2)}px`,
      padding: `${theme.spacing(3)}px ${theme.spacing(3)}px`,
    },
  })
)((props: MuiFormActionProps) => {
  const {
    title,
    cancel,
    save,
    onCancel,
    onSave,
    saveDisable,
    saveLoading,
    muiCardProps = {},
  } = props;

  return (
    <MuiCard {...muiCardProps}>
      <Box
        px={3}
        display={"flex"}
        flex={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        {React.isValidElement(title) ? (
          title
        ) : (
          <Typography variant={"subtitle2"}>{title}</Typography>
        )}

        <Box display={"flex"} alignItems={"center"}>
          {cancel !== undefined ? (
            <Box mr={1}>
              {React.isValidElement(cancel) ? (
                cancel
              ) : (
                <Button {...(onCancel ? { onClick: onCancel } : {})}>
                  {cancel}
                </Button>
              )}
            </Box>
          ) : null}
          {React.isValidElement(save) ? (
            save
          ) : (
            <Button
              variant={"contained"}
              color={"primary"}
              {...(onSave ? { onClick: onSave } : {})}
              disabled={saveDisable}
            >
              {saveLoading ? (
                <CircularProgress color="inherit" size={20} />
              ) : (
                save
              )}
            </Button>
          )}
        </Box>
      </Box>
    </MuiCard>
  );
});

export default MuiCardBody;
