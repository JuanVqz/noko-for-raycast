import { EntryType, ProjectType } from "../types";

export const buildLatestUsedByProject = (
  entries: EntryType[],
): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const entry of entries) {
    if (entry.project) {
      const current = map[entry.project.id];
      if (!current || entry.date > current) {
        map[entry.project.id] = entry.date;
      }
    }
  }
  return map;
};

export const sortProjectsByLatestUsed = (
  projects: ProjectType[],
  latestUsed: Record<string, string>,
): ProjectType[] => {
  return [...projects].sort((a, b) => {
    const dateA = latestUsed[a.id] ?? "";
    const dateB = latestUsed[b.id] ?? "";
    if (dateA === dateB) return a.name.localeCompare(b.name);
    return dateB.localeCompare(dateA);
  });
};
