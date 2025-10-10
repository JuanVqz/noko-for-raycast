import { List } from "@raycast/api";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => {
  return (
    <List isLoading={true}>
      <List.Item
        title={message}
        subtitle="Please wait while we fetch your data"
      />
    </List>
  );
};
