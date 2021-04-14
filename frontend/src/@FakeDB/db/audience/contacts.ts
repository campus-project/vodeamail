import mock from "../../mock";
import { responseGenerator } from "../../utilities";

let audienceContacts = [
  {
    email: "leonardus@vodea.id",
    contact_tags: ["vodea#all", "vodea#pm", "vodea#design"],
    group_contacts: ["lt#1"],
  },
  {
    email: "jovian@vodea.id",
    contact_tags: ["vodea#all", "vodea#developer"],
    group_contacts: ["lt#1"],
  },
  {
    email: "yudi@vodea.id",
    contact_tags: ["vodea#all", "vodea#developer"],
    group_contacts: ["lt#1"],
  },
  {
    email: "william@vodea.id",
    contact_tags: ["vodea#all", "vodea#developer"],
    group_contacts: ["lt#1"],
  },
  {
    email: "novliyansyah@vodea.id",
    contact_tags: ["vodea#all", "vodea#developer"],
    group_contacts: ["lt#1"],
  },
  {
    email: "yunisa@vodea.id",
    contact_tags: ["vodea#all", "vodea#content"],
    group_contacts: ["lt#2"],
  },
  {
    email: "pamela@vodea.id",
    contact_tags: ["vodea#all", "vodea#design"],
    group_contacts: ["lt#2"],
  },
  {
    email: "arron@vodea.id",
    contact_tags: ["vodea#all", "vodea#pm"],
    group_contacts: ["lt#1"],
  },
  {
    email: "miranda@vodea.id",
    contact_tags: ["vodea#all", "vodea#pm"],
    group_contacts: ["lt#2"],
  },
];

mock.onGet("/api/contact").reply(() => {
  return responseGenerator(audienceContacts);
});
