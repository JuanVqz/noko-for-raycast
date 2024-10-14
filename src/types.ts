interface IPreferences {
  personalAccessToken: string;
  userId: number;
}

type Project = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
};

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
};

type Tag = {
  id: string;
  name: string;
  formatted_name: string;
};

type Entry = {
  id: string;
  date: string;
  billable: boolean;
  minutes: number;
  formatted_minutes: string;
  description: string;
  user: User;
  tags: Tag[];
  project: Project;
};

export type { Entry, IPreferences };
