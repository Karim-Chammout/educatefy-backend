import { Course, Program } from '../../types/db-generated-types';

export const filterPublishedContent = (contents: ReadonlyArray<Course | Program>) => {
  if (!contents || contents.length === 0) {
    return [];
  }

  return contents.filter((content) => content.is_published);
};
