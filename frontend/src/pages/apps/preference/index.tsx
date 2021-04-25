import React, { Fragment } from "react";
import { Box, Grid, Link, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import MuiCard, { MuiCardProps } from "../../../components/ui/card/MuiCard";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { BoxProps } from "@material-ui/core/Box/Box";
import { Link as LinkDom } from "react-router-dom";
import { useSelector } from "react-redux";

const CardPreference = withStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      height: theme.spacing(18),
      padding: theme.spacing(3),
      color: theme.palette.text.primary,
    },
  })
)((props: MuiCardProps & { to?: string }) => <MuiCard {...props} />);

const CardPreferenceIcon = withStyles((theme: Theme) =>
  createStyles({
    root: {
      marginRight: theme.spacing(3),
      fontSize: 40,
    },
  })
)((props: BoxProps) => <Box {...props} />);

const CardPreferenceDescription = withStyles((theme: Theme) =>
  createStyles({
    root: {},
  })
)((props: BoxProps) => <Box {...props} />);

const Preference: React.FC<any> = () => {
  const { t } = useTranslation();

  const { preferences } = useSelector(({ setting }: any) => {
    return {
      preferences: setting.menu.preferences,
    };
  });

  return (
    <>
      <Box mb={3} display={"flex"} justifyContent={"space-between"}>
        <Typography variant={"h5"}>{t("pages:preference.title")}</Typography>
      </Box>

      <Grid container spacing={3}>
        {preferences.map((preference: any, index: number) => (
          <Fragment key={index}>
            <Grid item md={4} xs={12}>
              <CardPreference
                {...(preference.isNativeLink
                  ? {
                      component: Link,
                      href: preference.href,
                      target: "_blank",
                    }
                  : {
                      component: LinkDom,
                      to: preference.href,
                    })}
              >
                <CardPreferenceIcon>
                  <i className={`${preference.icon} nav-icon`} />
                </CardPreferenceIcon>
                <CardPreferenceDescription>
                  <Typography variant={"h6"}>{t(preference.title)}</Typography>
                  <Typography variant={"body2"}>
                    {t(preference.description)}
                  </Typography>
                </CardPreferenceDescription>
              </CardPreference>
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </>
  );
};

export default Preference;
