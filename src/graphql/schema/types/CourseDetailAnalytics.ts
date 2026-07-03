import { differenceInYears } from 'date-fns';
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

import { CourseStatus } from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { getImageURL } from '../../../utils/getImageURL.js';
import GraphQLDate from '../Scalars/Date.js';

export const CourseDetailMeta = new GraphQLObjectType({
  name: 'CourseDetailMeta',
  fields: () => ({
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
    },
    isPublished: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    level: {
      type: new GraphQLNonNull(GraphQLString),
    },
    language: {
      type: new GraphQLNonNull(GraphQLString),
    },
    startDate: {
      type: GraphQLDate,
    },
    endDate: {
      type: GraphQLDate,
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLDate),
    },
  }),
});

export const EnrollmentStatusCount = new GraphQLObjectType({
  name: 'EnrollmentStatusCount',
  fields: () => ({
    status: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Current enrollment status.',
    },
    count: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of students with this enrollment status.',
    },
  }),
});

export const RatingBucket = new GraphQLObjectType({
  name: 'RatingBucket',
  fields: () => ({
    stars: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    count: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  }),
});

export const SectionCompletionStat = new GraphQLObjectType({
  name: 'SectionCompletionStat',
  fields: () => ({
    sectionId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    completedCount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    totalEnrolled: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    completionRate: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  }),
});

export const CourseReviewDetail = new GraphQLObjectType({
  name: 'CourseReviewDetail',
  fields: () => ({
    reviewId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    rating: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    review: {
      type: GraphQLString,
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLDate),
    },
    reviewerFirstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    reviewerNickname: {
      type: GraphQLString,
    },
    reviewerAvatarUrl: {
      type: GraphQLString,
    },
  }),
});

export const DemographicBucket = new GraphQLObjectType({
  name: 'DemographicBucket',
  fields: () => ({
    label: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Label for the demographic bucket (e.g. country name, age range, etc.)',
    },
    count: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of students in this demographic bucket.',
    },
  }),
});

export const AudienceDemographics = new GraphQLObjectType({
  name: 'AudienceDemographics',
  fields: () => ({
    countryBreakdown: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DemographicBucket))),
      description: 'Breakdown of students by country.',
    },
    nationalityBreakdown: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DemographicBucket))),
      description: 'Breakdown of students by nationality.',
    },
    languageBreakdown: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DemographicBucket))),
      description: 'Breakdown of students by language.',
    },
    ageBreakdown: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DemographicBucket))),
      description: 'Breakdown of students by age range.',
    },
    ageDataCoverage: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of enrolled students for which age data is available.',
    },
  }),
});

export const EnrolledStudent = new GraphQLObjectType({
  name: 'EnrolledStudent',
  fields: () => ({
    accountId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    nickname: {
      type: GraphQLString,
    },
    avatarUrl: {
      type: GraphQLString,
    },
    country: {
      type: GraphQLString,
    },
    nationality: {
      type: GraphQLString,
    },
    age: {
      type: GraphQLInt,
    },
    enrolledAt: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'Date when the student enrolled in the course.',
    },
    status: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Current enrollment status of the student.',
    },
  }),
});

export const EnrolledStudentsPage = new GraphQLObjectType({
  name: 'EnrolledStudentsPage',
  fields: () => ({
    total: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Total number of enrolled students in the course.',
    },
    students: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EnrolledStudent))),
      description: 'List of enrolled students for the current page.',
    },
  }),
});

export const CourseDetailAnalytics = new GraphQLObjectType<{ courseId: number }, ContextType>({
  name: 'CourseDetailAnalytics',
  description: 'Detailed analytics for a single course.',
  fields: () => ({
    meta: {
      type: new GraphQLNonNull(CourseDetailMeta),
      resolve: async ({ courseId }, _, { db, loaders }) => {
        const course = await db('course')
          .where('id', courseId)
          .select(
            'denomination',
            'is_published',
            'level',
            'language_id',
            'start_date',
            'end_date',
            'created_at',
          )
          .first();

        const language = await loaders.Language.loadById(course.language_id);

        return {
          denomination: course.denomination,
          isPublished: course.is_published,
          level: course.level,
          language: language.denomination,
          startDate: course.start_date,
          endDate: course.end_date,
          createdAt: course.created_at,
        };
      },
    },

    enrollmentBreakdown: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EnrollmentStatusCount))),
      resolve: async ({ courseId }, _, { db }) => {
        const rows = await db('enrollment')
          .where('course_id', courseId)
          .select('status')
          .count('id as count')
          .groupBy('status');

        return rows.map((r) => ({
          status: r.status,
          count: parseInt(String(r.count)),
        }));
      },
    },

    dropOffCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of students whose current enrollment status is unenrolled.',
      resolve: async ({ courseId }, _, { db }) => {
        const result = await db('enrollment')
          .where('course_id', courseId)
          .where('status', 'unenrolled')
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },

    completionTransitionCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of students whose current enrollment status is completed.',
      resolve: async ({ courseId }, _, { db }) => {
        const result = await db('enrollment')
          .where('course_id', courseId)
          .where('status', 'completed')
          .count('id as count')
          .first();

        return parseInt(String(result?.count ?? 0));
      },
    },

    avgDaysToCompletion: {
      type: GraphQLFloat,
      description: 'Average days from enrollment to completion. Null if no completions yet.',
      resolve: async ({ courseId }, _, { db }) => {
        // Join enrollment with the history row that marks completion
        const rows = await db('enrollment as e')
          .join('enrollment_history as eh', 'eh.enrollment_id', 'e.id')
          .where('e.course_id', courseId)
          .where('eh.new_status', 'completed')
          .select(db.raw(`EXTRACT(EPOCH FROM (eh.created_at - e.created_at)) / 86400 as days`));

        if (!rows.length) return null;

        const total = rows.reduce(
          (sum: number, r: { days: string }) => sum + parseFloat(r.days),
          0,
        );

        return parseFloat((total / rows.length).toFixed(1));
      },
    },

    ratingDistribution: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RatingBucket))),
      resolve: async ({ courseId }, _, { db }) => {
        const rows = await db('course_rating')
          .where('course_id', courseId)
          .select(db.raw('ROUND(rating) as stars'))
          .count('id as count')
          .groupBy(db.raw('ROUND(rating)'))
          .orderBy('stars', 'asc');

        // Ensure all 5 buckets are always present
        const map = new Map<number, number>();
        for (const r of rows) {
          map.set(parseInt(String(r.stars)), parseInt(String(r.count)));
        }

        return [1, 2, 3, 4, 5].map((stars) => ({
          stars,
          count: map.get(stars) ?? 0,
        }));
      },
    },

    recentReviews: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CourseReviewDetail))),
      resolve: async ({ courseId }, _, { db }) => {
        const rows = await db('course_rating as cr')
          .join('account as a', 'a.id', 'cr.account_id')
          .where('cr.course_id', courseId)
          .orderBy('cr.created_at', 'desc')
          .limit(5)
          .select(
            'cr.id as reviewId',
            db.raw('COALESCE(cr.rating, 0) as rating'),
            'cr.review',
            'cr.created_at as createdAt',
            'a.first_name as reviewerFirstName',
            'a.nickname as reviewerNickname',
            'a.avatar_url as reviewerAvatarUrl',
          );

        return rows.map((r) => ({
          ...r,
          reviewerAvatarUrl: r.reviewerAvatarUrl ? getImageURL(r.reviewerAvatarUrl) : null,
        }));
      },
    },

    sectionCompletionStats: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SectionCompletionStat))),
      resolve: async ({ courseId }, _, { db }) => {
        const totalEnrolled = await db('enrollment')
          .where('course_id', courseId)
          .whereIn('status', ['enrolled', 'completed'])
          .count('id as count')
          .first();

        const total = parseInt(String(totalEnrolled?.count ?? 0));
        if (total === 0) return [];

        const sections = await db('course_section')
          .where('course_id', courseId)
          .whereNull('deleted_at')
          .orderBy('rank', 'asc')
          .select('id', 'denomination', 'rank');

        if (!sections.length) return [];

        const sectionIds = sections.map((s) => s.id);

        // Get all section items to find content component ids per section
        const sectionItems = await db('course_section_item')
          .whereIn('course_section_id', sectionIds)
          .whereNull('deleted_at')
          .select('course_section_id', 'content_id', 'content_type');

        // Get required content components for each item
        const contentIds = sectionItems.map((i) => i.content_id);

        const requiredComponents = contentIds.length
          ? await db('content_component')
              .whereIn('parent_id', contentIds)
              .where('is_required', true)
              .select('id', 'parent_id')
          : [];

        const requiredIdSet = new Set(requiredComponents.map((c) => c.id));

        if (requiredIdSet.size === 0) return [];

        // Get completion counts per component
        const progressRows = await db('content_component_progress')
          .whereIn('content_component_id', [...requiredIdSet])
          .where('is_completed', true)
          .select('content_component_id', 'enrollment_id')
          .countDistinct('enrollment_id as count')
          .groupBy(['content_component_id', 'enrollment_id']);

        const completionByComponent = new Map<number, number>();

        for (const row of progressRows) {
          completionByComponent.set(Number(row.content_component_id), parseInt(String(row.count)));
        }

        // Map section items back to sections
        const componentToSection = new Map<number, number>();
        for (const item of sectionItems) {
          const sectionComponents = requiredComponents.filter(
            (c) => c.parent_id === item.content_id,
          );
          for (const c of sectionComponents) {
            componentToSection.set(c.id, item.course_section_id);
          }
        }

        // Aggregate per section: a student "completed" a section
        // when they have progress on all required components in it
        const sectionCompletionMap = new Map<number, number>();
        for (const section of sections) {
          const sectionComponentIds = [...componentToSection.entries()]
            .filter(([, sId]) => sId === section.id)
            .map(([cId]) => cId);

          if (sectionComponentIds.length === 0) {
            sectionCompletionMap.set(section.id, 0);
            continue;
          }

          // Use the minimum completion count across required components
          // as the proxy for "completed the whole section"
          const minCompleted = Math.min(
            ...sectionComponentIds.map((cId) => completionByComponent.get(cId) ?? 0),
          );

          sectionCompletionMap.set(section.id, minCompleted);
        }

        return sections.map((section) => {
          const completedCount = sectionCompletionMap.get(section.id) ?? 0;
          return {
            sectionId: section.id,
            denomination: section.denomination,
            rank: section.rank,
            completedCount,
            totalEnrolled: total,
            completionRate: total > 0 ? parseFloat(((completedCount / total) * 100).toFixed(1)) : 0,
          };
        });
      },
    },

    audienceDemographics: {
      type: new GraphQLNonNull(AudienceDemographics),
      resolve: async ({ courseId }, _, { db }) => {
        // Get all active student account ids for this course
        const accountIds = await db('enrollment')
          .where('course_id', courseId)
          .whereIn('status', ['enrolled', 'completed'])
          .pluck('account_id');

        if (!accountIds.length) {
          return {
            countryBreakdown: [],
            nationalityBreakdown: [],
            languageBreakdown: [],
            ageBreakdown: [],
            ageDataCoverage: 0,
          };
        }

        const [countryRows, nationalityRows, languageRows, ageRows] = await Promise.all([
          // Country breakdown
          db('account as a')
            .join('country as c', 'c.id', 'a.country_id')
            .whereIn('a.id', accountIds)
            .whereNotNull('a.country_id')
            .select('c.denomination as label')
            .count('a.id as count')
            .groupBy('c.denomination')
            .orderBy('count', 'desc'),

          // Nationality breakdown
          db('account as a')
            .join('country as c', 'c.id', 'a.nationality_id')
            .whereIn('a.id', accountIds)
            .whereNotNull('a.nationality_id')
            .select('c.denomination as label')
            .count('a.id as count')
            .groupBy('c.denomination')
            .orderBy('count', 'desc'),

          // Preferred language breakdown
          db('account as a')
            .join('language as l', 'l.id', 'a.preferred_language_id')
            .whereIn('a.id', accountIds)
            .select('l.denomination as label')
            .count('a.id as count')
            .groupBy('l.denomination')
            .orderBy('count', 'desc'),

          // Age breakdown — compute age in Postgres, bucket in JS
          db('account')
            .whereIn('id', accountIds)
            .whereNotNull('date_of_birth')
            .select(db.raw(`EXTRACT(YEAR FROM AGE(date_of_birth))::int as age`)),
        ]);

        // Build age buckets
        const ageBucketMap = new Map<string, number>([
          ['< 18', 0],
          ['18-24', 0],
          ['25-34', 0],
          ['35-44', 0],
          ['45+', 0],
        ]);

        for (const { age } of ageRows as { age: number }[]) {
          if (age < 18) ageBucketMap.set('< 18', (ageBucketMap.get('< 18') ?? 0) + 1);
          else if (age <= 24) ageBucketMap.set('18-24', (ageBucketMap.get('18-24') ?? 0) + 1);
          else if (age <= 34) ageBucketMap.set('25-34', (ageBucketMap.get('25-34') ?? 0) + 1);
          else if (age <= 44) ageBucketMap.set('35-44', (ageBucketMap.get('35-44') ?? 0) + 1);
          else ageBucketMap.set('45+', (ageBucketMap.get('45+') ?? 0) + 1);
        }

        const ageBreakdown = [...ageBucketMap.entries()].map(([label, count]) => ({
          label,
          count,
        }));

        return {
          countryBreakdown: countryRows.map((r) => ({
            label: r.label,
            count: parseInt(String(r.count)),
          })),
          nationalityBreakdown: nationalityRows.map((r) => ({
            label: r.label,
            count: parseInt(String(r.count)),
          })),
          languageBreakdown: languageRows.map((r) => ({
            label: r.label,
            count: parseInt(String(r.count)),
          })),
          ageBreakdown,
          ageDataCoverage: ageRows.length,
        };
      },
    },

    enrolledStudents: {
      type: new GraphQLNonNull(EnrolledStudentsPage),
      args: {
        limit: {
          type: new GraphQLNonNull(GraphQLInt),
          defaultValue: 20,
        },
        offset: {
          type: new GraphQLNonNull(GraphQLInt),
          defaultValue: 0,
        },
      },
      resolve: async ({ courseId }, { limit, offset }, { db }) => {
        const enrollments = await db('enrollment as e')
          .join('account as a', 'a.id', 'e.account_id')
          .leftJoin('country as co', 'co.id', 'a.country_id')
          .leftJoin('country as na', 'na.id', 'a.nationality_id')
          .where('e.course_id', courseId)
          .whereIn('e.status', [CourseStatus.Enrolled, CourseStatus.Completed])
          .orderBy('e.created_at', 'desc')
          .limit(limit)
          .offset(offset)
          .select(
            'a.id as accountId',
            'a.first_name as firstName',
            'a.nickname',
            'a.avatar_url as avatarUrl',
            'a.date_of_birth as dateOfBirth',
            'co.denomination as country',
            'na.denomination as nationality',
            'e.created_at as enrolledAt',
            'e.status',
          );

        const totalResult = await db('enrollment')
          .where('course_id', courseId)
          .whereIn('status', [CourseStatus.Enrolled, CourseStatus.Completed])
          .count('id as count')
          .first();

        const total = parseInt(String(totalResult?.count ?? 0));

        const students = enrollments.map((e) => ({
          accountId: e.accountId,
          firstName: e.firstName,
          nickname: e.nickname,
          avatarUrl: e.avatarUrl ? getImageURL(e.avatarUrl) : null,
          age: e.dateOfBirth ? differenceInYears(new Date(), new Date(e.dateOfBirth)) : null,
          country: e.country,
          nationality: e.nationality,
          enrolledAt: e.enrolledAt,
          status: e.status,
        }));

        return {
          total,
          students,
        };
      },
    },
  }),
});
