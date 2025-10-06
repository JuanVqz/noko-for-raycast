interface IPreferences {
  personalAccessToken: string;
  userId: number;
}

type ApprovedByType = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
};

type UserType = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
};

type TagType = {
  id: string;
  name: string;
  formatted_name: string;
};

type ProjectType = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
};

type EntryType = {
  id: string;
  date: string;
  billable: boolean;
  minutes: number;
  formatted_minutes: string;
  description: string;
  approved_by: ApprovedByType | null;
  approved_at: string;
  user: UserType;
  tags: TagType[];
  project: ProjectType;
};

export enum EntryDateEnum {
  Yesterday = "Yesterday",
  Today = "Today",
  Tomorrow = "Tomorrow",
}

type TimerType = {
  id: string;
  state: TimerStateEnum;
  date: string;
  seconds: number;
  formatted_time: string;
  description: string;
  user: UserType;
  project: ProjectType;
  url: string;
  start_url: string;
  pause_url: string;
  add_or_subtract_time_url: string;
  log_url: string;
  log_inbox_entry_url: string;
};

export enum TimerStateEnum {
  Pending = "pending",
  Running = "running",
  Paused = "paused",
  Stopped = "stopped",
}

export type {
  EntryType,
  TimerType,
  IPreferences,
  UserType,
  ApprovedByType,
  TagType,
  ProjectType,
};
