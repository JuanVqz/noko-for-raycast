import { List } from '@raycast/api';

import  { Entry } from "./types";
import { useEntries } from './hooks/useEntries';

export default function Command() {

  const { isLoading, entries } = useEntries();

  return (
    <List isLoading={isLoading}>
      {entries.map(({id, description, project}: Entry) => (
        <List.Item key={id} title={project.name} subtitle={description} />
      ))}
    </List>
  );
}
