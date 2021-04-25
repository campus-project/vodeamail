import React, { lazy } from "react";
import { Navigate } from "react-router-dom";

import LayoutApps from "../layouts/apps/Apps";
import LayoutBaseApps from "../layouts/apps/BaseApps";

const Dashboard = lazy(() => import("../pages/apps/dashboard"));

//campaign
const EmailCampaign = lazy(
  () => import("../pages/apps/campaign/email-campaign")
);
const EmailCampaignForm = lazy(
  () => import("../pages/apps/campaign/email-campaign/Form")
);
const EmailTemplate = lazy(
  () => import("../pages/apps/campaign/email-template")
);
const EmailTemplateForm = lazy(
  () => import("../pages/apps/campaign/email-template/Form")
);

//audience
const Audience = lazy(() => import("../pages/apps/audience"));
const ContactForm = lazy(() => import("../pages/apps/audience/contact/Form"));
const GroupForm = lazy(() => import("../pages/apps/audience/group/Form"));

//analytic
const AnalyticEmail = lazy(() => import("../pages/apps/analytic/email"));
const AnalyticEmailDetail = lazy(
  () => import("../pages/apps/analytic/email/Detail")
);

//preference
const Preference = lazy(() => import("../pages/apps/preference"));
const Role = lazy(() => import("../pages/apps/preference/role"));
const RoleForm = lazy(() => import("../pages/apps/preference/role/Form"));
const User = lazy(() => import("../pages/apps/preference/user"));
const UserForm = lazy(() => import("../pages/apps/preference/user/Form"));
const GateSetting = lazy(() => import("../pages/apps/preference/gate-setting"));
const GateSettingForm = lazy(
  () => import("../pages/apps/preference/gate-setting/Form")
);
const Setting = lazy(() => import("../pages/apps/Setting"));

const routes = [
  {
    path: "apps",
    element: <LayoutApps />,
    children: [
      { path: "/", element: <Navigate to={"/apps/dashboard"} /> },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "campaign",
        element: <Navigate to={"/apps/campaign/email-campaign"} />,
      },
      { path: "campaign/email-campaign", element: <EmailCampaign /> },
      {
        path: "campaign/email-campaign/create",
        element: <EmailCampaignForm />,
      },
      {
        path: "campaign/email-campaign/:id/edit",
        element: <EmailCampaignForm />,
      },
      { path: "campaign/email-template", element: <EmailTemplate /> },

      { path: "audience", element: <Audience /> },
      { path: "audience/contact/create", element: <ContactForm /> },
      { path: "audience/contact/:id/edit", element: <ContactForm /> },
      { path: "audience/group/create", element: <GroupForm /> },
      { path: "audience/group/:id/edit", element: <GroupForm /> },

      {
        path: "analytic",
        element: <Navigate to={"/apps/analytic/email"} />,
      },
      { path: "analytic/email", element: <AnalyticEmail /> },
      {
        path: "analytic/email/:id",
        element: <AnalyticEmailDetail />,
      },

      { path: "preference", element: <Preference /> },

      { path: "preference/role", element: <Role /> },
      { path: "preference/role/create", element: <RoleForm /> },
      { path: "preference/role/:id/edit", element: <RoleForm /> },

      { path: "preference/user", element: <User /> },
      { path: "preference/user/:id/edit", element: <UserForm /> },

      { path: "preference/gate-setting", element: <GateSetting /> },
      { path: "preference/gate-setting/create", element: <GateSettingForm /> },
      {
        path: "preference/gate-setting/:id/edit",
        element: <GateSettingForm />,
      },

      //temporary for change i18n
      { path: "setting", element: <Setting /> },
    ],
  },
  {
    path: "apps/campaign",
    element: <LayoutBaseApps />,
    children: [
      { path: "email-template/create", element: <EmailTemplateForm /> },
      {
        path: "email-template/:id/edit",
        element: <EmailTemplateForm />,
      },
    ],
  },
];

export default routes;
