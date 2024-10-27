interface IPreferences {
  personalAccessToken: string;
  userId: number;
}

type ApprovedBy = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
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

type Project = {
  id: string;
  name: string;
  color: string;
};

type Entry = {
  id: string;
  date: string;
  billable: boolean;
  minutes: number;
  formatted_minutes: string;
  description: string;
  approved_by: ApprovedBy | null;
  approved_at: string;
  user: User;
  tags: Tag[];
  project: Project;
};

enum Filter {
  Yesterday = "Yesterday",
  Today = "Today",
  Tomorrow = "Tomorrow",
}

export { Filter };
export type { Entry, IPreferences };
