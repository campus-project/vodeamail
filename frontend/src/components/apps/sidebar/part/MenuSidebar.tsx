import React from "react";
import { Box, ButtonBase, Divider, Link, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { useStyles } from "../style";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import _ from "lodash";
import { useLocation } from "react-router";
import { setSidebarClose } from "../../../../store/actions/setting";

const CreateCampaign: React.FC<any> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { pathname } = useLocation();

  const dispatch = useDispatch();
  const { items, variant, isOpen } = useSelector(({ setting }: any) => {
    return {
      items: setting.menu.items,
      variant: setting.sidebar.variant,
      isOpen: setting.sidebar.isOpen,
    };
  });

  const isLinkActive = (menu: any): boolean => {
    const activePath = makeActivePath(menu);
    if (activePath.includes(pathname)) {
      return true;
    }

    const routesWithSlug = activePath.filter((a) => a.match(/:slug|:id/g));
    if (routesWithSlug.length) {
      //todo: make navigation class active by slug url
      // routesWithSlug.forEach((route) => {
      //   const matched = 0;
      //   const totalSlug = route.split("/").filter((a) => a.match(/:slug|:id/g))
      //     .length;
      //   console.log(totalSlug);
      // });
      // console.log(pathname);
    }

    return makeActivePath(menu).includes(pathname);
  };

  const makeActivePath = (menu: any): string[] => {
    const activePath: string[] = (menu?.children || [])
      .map((child: any) => {
        return child?.href || null;
      })
      .filter((a: any) => a);

    if (menu.href) {
      activePath.push(menu.href);
    }

    if (Array.isArray(menu.otherUrls)) {
      activePath.push(...menu.otherUrls);
    }

    return activePath;
  };

  const handleClick = () => {
    if (variant === "temporary" && isOpen) {
      dispatch(setSidebarClose());
    }
  };

  return (
    <>
      <Divider variant="middle" />

      <Box className={classes.sidebar}>
        <ul className={"nav-list"}>
          {items.map((menu: any, index: number) => (
            <li
              key={index}
              className={classNames({
                "nav-item": true,
                opened: !_.isEmpty(menu.children) && isLinkActive(menu),
              })}
            >
              <Link component={NavLink} to={menu.href} onClick={handleClick}>
                <ButtonBase
                  component={"label"}
                  className={classNames({
                    "nav-link": true,
                    active: _.isEmpty(menu.children) && isLinkActive(menu),
                  })}
                >
                  <i className={`${menu.icon} nav-icon`} />
                  <Typography variant={"body2"}>{t(menu.label)}</Typography>
                </ButtonBase>
              </Link>

              {menu.children && (
                <Box className="nav-dropdown">
                  <ul className="dropdown-list">
                    {menu.children.map((child: any, childKey: number) => (
                      <li className="dropdown-item" key={childKey}>
                        <Link
                          component={NavLink}
                          to={child.href}
                          onClick={handleClick}
                        >
                          <ButtonBase
                            component={"label"}
                            className={classNames({
                              "dropdown-link": true,
                              active: isLinkActive(child),
                            })}
                          >
                            <Typography variant={"body2"}>
                              {t(child.label)}
                            </Typography>
                          </ButtonBase>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </li>
          ))}
        </ul>
      </Box>
    </>
  );
};

export default CreateCampaign;
