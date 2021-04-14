import mock from "../../mock";
import { responseGenerator } from "../../utilities";

let audienceGroups = [
  { id: 1, name: "lt#1" },
  { id: 2, name: "lt#2" },
];

mock.onGet("/api/audience/group").reply(() => {
  return responseGenerator(audienceGroups);
});
