export const COLOR_MIN = 3;
export const COLOR_MAX = 20;

export const BOARD = {
  TITLE: { MIN: 1, MAX: 50 },
  DESCRIPTION: { MIN: 0, MAX: 1000 },
  USER_IDS: { MAX: 100 },
  TAG_IDS: { MAX: 100 },
  COLUMNS: {
    MAX: 20,
    TITLE: { MIN: 1, MAX: 50 },
    TASKS: {
      MAX: 500,
      TAG_IDS: { MAX: 100 },
      ASSIGNEE_IDS: { MAX: 10 },
    },
  },
};

export const ROADMAP = {
  TITLE: { MIN: 1, MAX: 50 },
  DESCRIPTION: { MIN: 0, MAX: 1000 },
  USER_IDS: { MAX: 100 },
  QUARTERS: {
    TITLE: { MIN: 1, MAX: 50 },
  },
  MILESTONES: {
    TITLE: { MIN: 1, MAX: 50 },
  },
  CATEGORIES: {
    TITLE: { MIN: 1, MAX: 50 },
    ROWS: {
      TASKS: {
        TITLE: { MIN: 1, MAX: 50 },
        PROGRESS: { MIN: 0, MAX: 100 },
      },
    },
  },
};

export const TAG = {
  TITLE: { MIN: 1, MAX: 20 },
  COLOR: { MIN: 3, MAX: 20 },
};

export const TASK = {
  TITLE: { MIN: 1, MAX: 50 },
  DESCRIPTION: { MIN: 0, MAX: 1000 },
  CATEGORIES: { MAX: 10 },
  LINKS: { MAX: 10 },
};

export const SUBTASK = {
  TITLE: { MIN: 1, MAX: 50 },
  DESCRIPTION: { MIN: 0, MAX: 1000 },
  CATEGORIES: { MAX: 10 },
  LINKS: { MAX: 10 },
};

export const CATEGORY = {
  TITLE: {
    MIN: 1,
    MAX: 20,
  },
  COLOR: {
    MIN: 3,
    MAX: 20,
  },
};

export const USER = {
  USERNAME: {
    MIN: 3,
    MAX: 20,
  },
  PASSWORD: {
    REGEX: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
    ERROR_MESSAGE:
      "Password must contain at least 8 characters, including a number, a capital letter, and a symbol",
  },
};
