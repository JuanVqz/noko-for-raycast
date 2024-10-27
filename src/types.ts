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

export enum FilterType {
  Yesterday = "Yesterday",
  Today = "Today",
  Tomorrow = "Tomorrow",
}

export type {
  EntryType,
  IPreferences
};
