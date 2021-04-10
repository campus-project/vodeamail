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
const Analytic = lazy(() => import("../pages/apps/analytic"));

//preference
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
