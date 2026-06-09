export const ROOT_PATH = "/";
export const CAMPAIGN_PATH = "/campaigns";
export const EVENT_PATH = "/events";
export const MESSAGE_PATH = "/messages";

export const CAMPAIGN_ROUTES = {
  root: () => "/campaigns",
  new: () => "/campaigns/new",
  detail: (id: string) => `/campaigns/${id}`,
  edit: (id: string) => `/campaigns/${id}/edit`,
};

export const MESSAGE_ROUTES = {
  root: () => "/messages",
  detail: (id: string) => `/messages/${id}`,
  edit: (id: string) => `/messages/${id}/edit`,
};

export const EVENT_ROUTES = {
  root: () => "/events",
  detail: (id: string) => `/events/${id}`,
};