import { Course } from '../../types/db-generated-types';

export const filterPublishedCoursesList = (courses: readonly Course[]) => {
  if (!courses || courses.length === 0) {
    return [];
  }

  return courses.filter((course) => course.is_published);
};
