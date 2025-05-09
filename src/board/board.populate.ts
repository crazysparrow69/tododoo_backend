import { getUserReferencePopulate } from "src/user/user.populate";

export const getBoardPopulate = () => [
  {
    path: "tagIds",
    model: "BoardTag",
    select: "-__v -createdAt -updatedAt",
  },
  {
    path: "columns",
    populate: {
      path: "tasks",
      populate: [
        {
          path: "tagIds",
          model: "BoardTag",
          select: "-__v -createdAt -updatedAt",
        },
        getUserReferencePopulate("assigneeIds"),
      ],
    },
  },
  getUserReferencePopulate("userIds"),
];
