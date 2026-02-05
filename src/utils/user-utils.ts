import { UserType } from "../types";

export const userName = (user: UserType | null | undefined): string => {
  if (!user?.first_name || !user?.last_name || !user?.email) {
    return "";
  }
  return `${user.first_name} ${user.last_name} <${user.email}>`;
};

export const formatTags = (
  tags: Array<{ formatted_name: string }> | null | undefined,
): string => {
  if (!tags || tags.length === 0) {
    return "";
  }
  return tags.map((tag) => tag.formatted_name).join(", ");
};
