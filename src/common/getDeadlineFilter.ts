export const getDeadlineFilter = (deadline: string = "all"): object | null => {
  const date = new Date();
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate();
  const todayMidnight = new Date(`${year}-${month}-${day}`);

  switch (deadline) {
    case "day":
      return todayMidnight;
    case "week":
      return {
        $gte: todayMidnight,
        $lte: new Date(date.setDate(date.getDate() + 7)),
      };
    case "month":
      return {
        $gte: todayMidnight,
        $lte: new Date(date.setMonth(date.getMonth() + 1)),
      };
    case "year":
      return {
        $gte: todayMidnight,
        $lte: new Date(`${year + 1}-${month}-${day}`),
      };
    case "outdated":
      return { $lt: todayMidnight };
    case "nodeadline":
      return null;
  }
};
