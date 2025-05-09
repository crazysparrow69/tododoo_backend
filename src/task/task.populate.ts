import { getUserReferencePopulate } from "src/user/user.populate";

export const getTaskPopulate = () => [
  { path: "categories", select: "_id title color" },
  {
    path: "subtasks",
    select: "-_v -createdAt -updatedAt -categories -links",
    populate: getUserReferencePopulate("assigneeId"),
  },
];

export const getSubtaskPopulate = () => [
  {
    path: "categories",
    select: "_id title color",
  },
  getUserReferencePopulate("userId"),
];
