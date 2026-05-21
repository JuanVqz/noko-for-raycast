export const combineDescriptionAndTags = (
  description: string,
  tags: string[],
): string => {
  return description.concat(" ", tags.join(" ")).trim();
};

export const stripTagsFromDescription = (description: string): string => {
  return description.replace(/#\S+/g, "").replace(/\s+/g, " ").trim();
};
