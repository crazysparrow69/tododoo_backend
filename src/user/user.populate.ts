export const getUserReferencePopulate = (path: string) => ({
  path,
  select: "_id username avatarId avatarEffectId",
  populate: [
    {
      path: "avatarId",
      select: "-_id url",
    },
    {
      path: "avatarEffectId",
      select: "preview.url animated.url",
    },
  ],
});

export const getUserPopulate = () => [
  {
    path: "avatarId",
    select: "-_id url",
  },
  {
    path: "profileEffectId",
    select: "intro.url preview.url sides.url top.url",
  },
  {
    path: "avatarEffectId",
    select: "preview.url animated.url",
  },
];
