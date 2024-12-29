export const isValidSlug = (slug: string) => {
  const slugRegex = /^[a-z0-9]+[-_a-z0-9]*[a-z0-9]$/;

  return slugRegex.test(slug);
};
