import DataLoader from 'dataloader';

import { CourseRating as CourseRatingType } from '../../../../types/db-generated-types';
import { CourseRatingBase } from './CourseRating.generated';

export class CourseRatingReader extends CourseRatingBase {
  private byAccountIdAndCourseIdLoader: DataLoader<
    { accountId: number; courseId: number },
    CourseRatingType
  >;

  constructor(db: ConstructorParameters<typeof CourseRatingBase>[0]) {
    super(db);

    this.byAccountIdAndCourseIdLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await this.db
          .table('course_rating')
          .where((builder) =>
            keys.forEach((key) =>
              builder.orWhere({
                account_id: key.accountId,
                course_id: key.courseId,
              }),
            ),
          )
          .select()
          .then((results) =>
            keys.map((key) =>
              results.find((x) => x.account_id === key.accountId && x.course_id === key.courseId),
            ),
          );

        return rows;
      },
      {
        cacheKeyFn: (key) => `${key.accountId}:${key.courseId}`,
      },
    );
  }

  get loaders() {
    return {
      ...super.loaders,
      byAccountIdAndCourseIdLoader: this.byAccountIdAndCourseIdLoader,
    };
  }

  loadByAccountIdAndCourseId(accountId: number, courseId: number): Promise<CourseRatingType> {
    return this.byAccountIdAndCourseIdLoader.load({ accountId, courseId });
  }
}
