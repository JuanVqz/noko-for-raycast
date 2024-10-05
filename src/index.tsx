import { List, getPreferenceValues } from '@raycast/api';
import { useFetch } from "@raycast/utils";
import { useState } from "react";

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

type State = {
  isLoading: boolean;
  entries: Entry[];
}

export default function Command() {
  const { personalAccessToken } = getPreferenceValues<Preferences>();

  const [state, setState] = useState<State>({
    isLoading: true,
    entries: [],
  });

  useFetch("https://api.nokotime.com/v2/entries", {
    headers: {
      "X-NokoToken": personalAccessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    onData: (data: Entry[]) => {
      setState({ isLoading: false, entries: data });
    },
    keepPreviousData: true,
  })

  return (
    <List isLoading={state.isLoading}>
      {state.entries.map(({id, description, project}: Entry) => (
        <List.Item key={id} title={project.name} subtitle={description} />
      ))}
    </List>
  );
}
