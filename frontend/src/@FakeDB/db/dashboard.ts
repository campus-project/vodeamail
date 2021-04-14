import mock from "../mock";
import { responseGenerator } from "../utilities";

mock.onGet("/api/dashboard/email-campaign").reply(() => {
  return responseGenerator({
    mail_opened: 90,
    mail_clicked: 80,
    mail_delivered: 99,
    mail_total: 100,
    campaign_total: 7,
  });
});

mock.onGet("/api/dashboard/email-transaction").reply(() => {
  return responseGenerator({
    mail_opened: 90,
    mail_clicked: 80,
    mail_delivered: 99,
    mail_total: 100,
    campaign_total: 7,
  });
});
