import mock from "../../mock";
import { responseGenerator } from "../../utilities";

let campaignEmails = [
  { id: 1, name: "Campaign #1", date: "2020-01-01" },
  { id: 2, name: "Campaign #2", date: "2020-02-01" },
  { id: 3, name: "Campaign #3", date: "2020-03-01" },
  { id: 4, name: "Campaign #4", date: "2020-04-01" },
  { id: 5, name: "Campaign #5", date: "2020-05-01" },
  { id: 6, name: "Campaign #6", date: "2020-06-01" },
  { id: 7, name: "Campaign #7", date: "2020-07-01" },
  { id: 8, name: "Campaign #8", date: "2020-08-01" },
  { id: 9, name: "Campaign #9", date: "2020-09-01" },
  { id: 10, name: "Campaign #10", date: "2020-10-01" },
  { id: 11, name: "Campaign #11", date: "2020-11-01" },
  { id: 12, name: "Campaign #12", date: "2020-12-01" },
  { id: 13, name: "Campaign #13", date: "2021-01-01" },
  { id: 14, name: "Campaign #14", date: "2021-02-01" },
  { id: 15, name: "Campaign #15", date: "2022-03-01" },
];

mock.onGet("/api/campaign/email").reply(() => {
  return responseGenerator(campaignEmails);
});
