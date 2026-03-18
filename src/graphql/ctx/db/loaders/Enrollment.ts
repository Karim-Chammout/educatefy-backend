import DataLoader from 'dataloader';

import { Enrollment as EnrollmentType } from '../../../../types/db-generated-types';
import { EnrollmentBase } from './Enrollment.generated';

export class EnrollmentReader extends EnrollmentBase {
  private byAccountIdAndCourseIdLoader: DataLoader<
    { accountId: number; courseId: number },
    EnrollmentType
  >;

  constructor(db: ConstructorParameters<typeof EnrollmentBase>[0]) {
    super(db);

    this.byAccountIdAndCourseIdLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await this.db
          .table('enrollment')
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

  loadByAccountIdAndCourseId(accountId: number, courseId: number): Promise<EnrollmentType> {
    return this.byAccountIdAndCourseIdLoader.load({ accountId, courseId });
  }
}
