export const combineDescriptionAndTags = (
  description: string,
  tags: string[],
): string => {
  return description.concat(" ", tags.join(" ")).trim();
};
