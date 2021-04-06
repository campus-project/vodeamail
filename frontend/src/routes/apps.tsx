import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import CampaignEmailEditor from "../pages/apps/campaign/EmailEditor";

import LayoutApps from "../layouts/Apps/Apps";
import LayoutBaseApps from "../layouts/Apps/BaseApps";

const Dashboard = lazy(() => import("../pages/apps/dashboard"));
const Campaign = lazy(() => import("../pages/apps/campaign"));
const CampaignForm = lazy(() => import("../pages/apps/campaign/Form"));
const Audience = lazy(() => import("../pages/apps/audience"));
const ContactForm = lazy(() => import("../pages/apps/audience/contact/Form"));
const GroupForm = lazy(() => import("../pages/apps/audience/group/Form"));
const Analytic = lazy(() => import("../pages/apps/analytic"));
const Preference = lazy(() => import("../pages/apps/preference"));
const Organization = lazy(
  () => import("../pages/apps/preference/organization")
);
const Role = lazy(() => import("../pages/apps/preference/role"));
const RoleForm = lazy(() => import("../pages/apps/preference/role/Form"));
const GateSetting = lazy(() => import("../pages/apps/preference/gate-setting"));
const Profile = lazy(() => import("../pages/apps/Profile"));
const Setting = lazy(() => import("../pages/apps/Setting"));

const routes = [
  {
    path: "apps",
    element: <LayoutApps />,
    children: [
      { path: "/", element: <Navigate to={"dashboard"} /> },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      { path: "campaign", element: <Campaign /> },
      { path: "campaign/create", element: <CampaignForm /> },
      { path: "campaign/:id/edit", element: <CampaignForm /> },

      { path: "audience", element: <Audience /> },
      { path: "audience/contact/create", element: <ContactForm /> },
      { path: "audience/contact/:id/edit", element: <ContactForm /> },
      { path: "audience/group/create", element: <GroupForm /> },
      { path: "audience/group/:id/edit", element: <GroupForm /> },

      { path: "analytic", element: <Analytic /> },

      { path: "preference", element: <Preference /> },
      { path: "preference/organization", element: <Organization /> },

      { path: "preference/role", element: <Role /> },
      { path: "preference/role/create", element: <RoleForm /> },
      { path: "preference/role/:id/edit", element: <RoleForm /> },

      { path: "preference/gate-setting", element: <GateSetting /> },

      { path: "profile", element: <Profile /> },
      { path: "setting", element: <Setting /> },
    ],
  },
  {
    path: "apps/campaign",
    element: <LayoutBaseApps />,
    children: [{ path: "email-editor", element: <CampaignEmailEditor /> }],
  },
];

export default routes;
