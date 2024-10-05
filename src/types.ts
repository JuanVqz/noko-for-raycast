interface Preferences {
  personalAccessToken: string;
}

type Project = {
  id: string;
  name: string;
};

type Tag = {
  id: string;
  name: string;
  formatted_name: string;
};

type Entry = {
  id: string;
  description: string;
  project: Project;
  tags: Tag[];
};

export type { Entry, Preferences };
