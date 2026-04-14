export const ROOT_PATH = "/";
export const CAMPAIGN_PATH = "/campaigns";
export const EVENT_PATH = "/events";
export const MESSAGE_PATH = "/messages";

export const CAMPAIGN_ROUTES = {
  root: "",
  new: "new",
  detail: ":id",
  edit: ":id/edit",
};

export const EVENT_ROUTES = {
  root: "",
  detail: ":id",
};

export const MESSAGE_ROUTES = {
  root: "",
  detail: ":id",
  edit: ":id/edit",
};
