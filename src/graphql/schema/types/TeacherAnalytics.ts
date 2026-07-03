import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { EnrollmentStatusType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { formatDateKey, generateDateRangeKeys, getDateRange } from '../../utils/dateUtils.js';

export const EnrollmentTrendPoint = new GraphQLObjectType({
  name: 'EnrollmentTrendPoint',
  fields: () => ({
    date: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'ISO date string e.g. 2025-04-01',
    },
    count: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  }),
});

export const CourseAnalytics = new GraphQLObjectType({
  name: 'CourseAnalytics',
  fields: () => ({
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
    },
    isPublished: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    enrolledCount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    completedCount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    completionRate: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    averageRating: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    ratingsCount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  }),
});

export const TeacherAnalytics = new GraphQLObjectType<{ teacherId: number }, ContextType>({
  name: 'TeacherAnalytics',
  description: 'Aggregated analytics data for a teacher.',
  fields: () => ({
    totalEnrollments: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Total number of enrollments across all courses by the teacher.',
      resolve: async ({ teacherId }, _, { db, loaders }) => {
        const courses = await loaders.Course.loadByTeacherId(teacherId);

        if (!courses.length) return 0;

        const courseIds = courses.map((c) => c.id);

        const result = await db('enrollment')
          .whereIn('course_id', courseIds)
          .whereIn('status', [EnrollmentStatusType.Enrolled, EnrollmentStatusType.Completed])
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },
    totalCompletions: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Total number of completed enrollments across all courses by the teacher.',
      resolve: async ({ teacherId }, _, { db, loaders }) => {
        const courses = await loaders.Course.loadByTeacherId(teacherId);

        if (!courses.length) return 0;

        const courseIds = courses.map((c) => c.id);

        const result = await db('enrollment')
          .whereIn('course_id', courseIds)
          .where('status', EnrollmentStatusType.Completed)
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },
    overallCompletionRate: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'Overall completion rate across all courses by the teacher.',
      resolve: async ({ teacherId }, _, { db, loaders }) => {
        const courses = await loaders.Course.loadByTeacherId(teacherId);

        if (!courses.length) return 0;

        const courseIds = courses.map((c) => c.id);

        const [enrollments, completions] = await Promise.all([
          db('enrollment')
            .whereIn('course_id', courseIds)
            .whereIn('status', [EnrollmentStatusType.Enrolled, EnrollmentStatusType.Completed])
            .count('id as count')
            .first(),
          db('enrollment')
            .whereIn('course_id', courseIds)
            .where('status', EnrollmentStatusType.Completed)
            .count('id as count')
            .first(),
        ]);

        const total = parseInt(String(enrollments?.count ?? 0));
        const completed = parseInt(String(completions?.count ?? 0));

        if (total === 0) return 0;

        return parseFloat(((completed / total) * 100).toFixed(1));
      },
    },
    overallAverageRating: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'Average rating across all courses by the teacher.',
      resolve: async ({ teacherId }, _, { db, loaders }) => {
        const courses = await loaders.Course.loadByTeacherId(teacherId);

        if (!courses.length) return 0;

        const courseIds = courses.map((c) => c.id);

        const result = await db('course_rating')
          .whereIn('course_id', courseIds)
          .avg('rating as average')
          .first();

        if (!result?.average) return 0;

        return parseFloat(parseFloat(result.average).toFixed(2));
      },
    },
    totalReviewsCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Total number of course reviews for the teacher.',
      resolve: async ({ teacherId }, _, { db, loaders }) => {
        const courses = await loaders.Course.loadByTeacherId(teacherId);

        if (!courses.length) return 0;

        const courseIds = courses.map((c) => c.id);

        const result = await db('course_rating')
          .whereIn('course_id', courseIds)
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },
    publishedCoursesCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of published courses by the teacher.',
      resolve: async ({ teacherId }, _, { db }) => {
        const result = await db('course')
          .where('teacher_id', teacherId)
          .where('is_published', true)
          .whereNull('deleted_at')
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },
    draftCoursesCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of courses in draft state (not published) by the teacher.',
      resolve: async ({ teacherId }, _, { db }) => {
        const result = await db('course')
          .where('teacher_id', teacherId)
          .where('is_published', false)
          .whereNull('deleted_at')
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },
    publishedProgramsCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of published programs by the teacher.',
      resolve: async ({ teacherId }, _, { db }) => {
        const result = await db('program')
          .where('teacher_id', teacherId)
          .where('is_published', true)
          .whereNull('deleted_at')
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },
    draftProgramsCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of programs in draft state (not published) by the teacher.',
      resolve: async ({ teacherId }, _, { db }) => {
        const result = await db('program')
          .where('teacher_id', teacherId)
          .where('is_published', false)
          .whereNull('deleted_at')
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },
    totalUniqueStudents: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Total number of unique students enrolled in any course by the teacher.',
      resolve: async ({ teacherId }, _, { db, loaders }) => {
        const courses = await loaders.Course.loadByTeacherId(teacherId);

        if (!courses.length) return 0;

        const courseIds = courses.map((c) => c.id);

        const result = await db('enrollment')
          .whereIn('course_id', courseIds)
          .whereIn('status', [EnrollmentStatusType.Enrolled, EnrollmentStatusType.Completed])
          .countDistinct('account_id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },
    totalProgramEnrollments: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Total number of enrollments across all programs taught by the teacher.',
      resolve: async ({ teacherId }, _, { db, loaders }) => {
        const programs = await loaders.Program.loadByTeacherId(teacherId);

        if (!programs.length) return 0;

        const programIds = programs.map((p) => p.id);

        const result = await db('account__program')
          .whereIn('program_id', programIds)
          .whereNull('deleted_at')
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },
    newFollowersLastMonth: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of new followers in the last 30 days.',
      resolve: async ({ teacherId }, _, { db }) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await db('student_teacher_follow')
          .where('teacher_id', teacherId)
          .where('is_following', true)
          .where('created_at', '>=', thirtyDaysAgo)
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },
    courseStats: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CourseAnalytics))),
      description: 'Analytics data for each course by the teacher.',
      resolve: async ({ teacherId }, _, { db, loaders }) => {
        const courses = await loaders.Course.loadByTeacherId(teacherId);

        if (!courses.length) return [];

        const courseIds = courses.map((c) => c.id);

        const [enrollmentRows, ratingRows] = await Promise.all([
          db('enrollment')
            .whereIn('course_id', courseIds)
            .whereIn('status', [EnrollmentStatusType.Enrolled, EnrollmentStatusType.Completed])
            .select('course_id', 'status'),
          db('course_rating').whereIn('course_id', courseIds).select('course_id', 'rating'),
        ]);

        const enrollmentsByCourse = new Map<number, typeof enrollmentRows>();
        for (const row of enrollmentRows) {
          if (!enrollmentsByCourse.has(row.course_id)) {
            enrollmentsByCourse.set(row.course_id, []);
          }
          enrollmentsByCourse.get(row.course_id)!.push(row);
        }

        const ratingsByCourse = new Map<number, number[]>();
        for (const row of ratingRows) {
          if (!ratingsByCourse.has(row.course_id)) {
            ratingsByCourse.set(row.course_id, []);
          }
          ratingsByCourse.get(row.course_id)!.push(row.rating);
        }

        return courses.map((course) => {
          const enrollments = enrollmentsByCourse.get(course.id) ?? [];
          const ratings = ratingsByCourse.get(course.id) ?? [];

          const enrolledCount = enrollments.length;
          const completedCount = enrollments.filter(
            (e) => e.status === EnrollmentStatusType.Completed,
          ).length;
          const completionRate =
            enrolledCount > 0 ? parseFloat(((completedCount / enrolledCount) * 100).toFixed(1)) : 0;

          const averageRating =
            ratings.length > 0
              ? parseFloat((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2))
              : 0;

          return {
            courseId: course.id,
            denomination: course.denomination,
            isPublished: course.is_published,
            enrolledCount,
            completedCount,
            completionRate,
            averageRating,
            ratingsCount: ratings.length,
          };
        });
      },
    },
    enrollmentTrend: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EnrollmentTrendPoint))),
      description:
        "Number of new enrollments per day for the teacher's courses over the last 30 days.",
      resolve: async ({ teacherId }, _, { db, loaders }) => {
        const courses = await loaders.Course.loadByTeacherId(teacherId);

        if (!courses.length) return [];

        const courseIds = courses.map((c) => c.id);
        const { startDate } = getDateRange(30);

        const rows = await db('enrollment')
          .whereIn('course_id', courseIds)
          .whereIn('status', [EnrollmentStatusType.Enrolled, EnrollmentStatusType.Completed])
          .where('created_at', '>=', startDate)
          .select(db.raw("date_trunc('day', created_at) as date"))
          .count('id as count')
          .groupBy(db.raw("date_trunc('day', created_at)"))
          .orderBy('date', 'asc');

        const countMap = new Map<string, number>();
        for (const row of rows) {
          const dateStr = formatDateKey(new Date(row.date));
          countMap.set(dateStr, parseInt(String(row.count)));
        }

        const dateRange = generateDateRangeKeys(30);

        return dateRange.map((date) => ({
          date: formatDateKey(date),
          count: countMap.get(formatDateKey(date)) ?? 0,
        }));
      },
    },
  }),
});
