import {
  GraphQLBoolean,
  GraphQLError,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  EnrollmentStatusType,
  Program as ProgramType,
  ProgramVersionStatusType,
} from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { getImageURL } from '../../../utils/getImageURL';
import { authenticated } from '../../utils/auth';
import GraphQLDate from '../Scalars/Date';
import ProgramLevel from './enum/ProgramLevel';
import ProgramStatus, { ProgramStatusEnum } from './enum/ProgramStatus';
import { ProgramObjective } from './ProgramObjective';
import { ProgramRequirement } from './ProgramRequirement';
import { ProgramVersion } from './ProgramVersion';
import { Subject } from './Subject';
import { Teacher } from './Teacher';

export const Program: GraphQLObjectType = new GraphQLObjectType<ProgramType, ContextType>({
  name: 'Program',
  description: 'The program info.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this program.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this program.',
    },
    slug: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A unique slug of this program.',
    },
    subtitle: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The subtitle of this program.',
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description of this program.',
    },
    level: {
      type: new GraphQLNonNull(ProgramLevel),
      description: 'The difficulty level of this program.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this program is published or not.',
    },
    image: {
      type: GraphQLString,
      description: 'The image of this program.',
      resolve: async (parent) => {
        return parent.image ? getImageURL(parent.image) : null;
      },
    },
    created_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date of when this program was created.',
    },
    updated_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date of when this program was last updated.',
    },
    subjects: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Subject))),
      description: 'The subjects linked to this program.',
      resolve: async (parent, _, { loaders }) => {
        const subjects = await loaders.Subject.loadByProgramId(parent.id);

        if (!subjects || subjects.length === 0) {
          return [];
        }

        return subjects;
      },
    },
    objectives: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProgramObjective))),
      description: 'The objectives of this program.',
      resolve: async (parent, _, { loaders }) => {
        const programObjectives = await loaders.ProgramObjective.loadByProgramId(parent.id);

        if (!programObjectives || programObjectives.length === 0) {
          return [];
        }

        return programObjectives;
      },
    },
    requirements: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProgramRequirement))),
      description: 'The requirements of this program.',
      resolve: async (parent, _, { loaders }) => {
        const programRequirements = await loaders.ProgramRequirement.loadByProgramId(parent.id);

        if (!programRequirements || programRequirements.length === 0) {
          return [];
        }

        return programRequirements;
      },
    },
    status: {
      type: new GraphQLNonNull(ProgramStatus),
      description: 'The status of the program for the current user.',
      resolve: async (parent, _, { user, loaders }) => {
        if (!user.authenticated) {
          return ProgramStatusEnum.NOT_STARTED;
        }

        const programEnrollment = await loaders.AccountProgram.loadByAccountIdAndProgramId(
          user.id,
          parent.id,
        );

        if (!programEnrollment) {
          return ProgramStatusEnum.NOT_STARTED;
        }

        const programVersion = await loaders.ProgramVersion.loadById(
          programEnrollment.program_version_id,
        );

        if (!programVersion) {
          throw new GraphQLError(ErrorType.NOT_FOUND);
        }

        const courseProgramVersionLinks = await loaders.CourseProgramVersion.loadByProgramVersionId(
          programVersion.id,
        );

        if (!courseProgramVersionLinks || courseProgramVersionLinks.length === 0) {
          return ProgramStatusEnum.IN_PROGRESS;
        }

        const versionCourseIds = new Set(courseProgramVersionLinks.map((link) => link.course_id));

        const allAccountEnrollments = await loaders.Enrollment.loadByAccountId(user.id);

        const completedCount = allAccountEnrollments.filter(
          (enrollment) =>
            versionCourseIds.has(enrollment.course_id) &&
            enrollment.status === EnrollmentStatusType.Completed,
        ).length;

        if (completedCount === versionCourseIds.size) {
          return ProgramStatusEnum.COMPLETED;
        }

        return ProgramStatusEnum.IN_PROGRESS;
      },
    },
    currentVersion: {
      type: new GraphQLNonNull(ProgramVersion),
      description:
        'The relevant program version for the current user. Returns the draft version for the owning teacher, the enrolled version for an enrolled student, and the latest published version for everyone else.',
      resolve: async (parent, _, { user, loaders }) => {
        // Enrolled student — return the version they enrolled on
        if (user.authenticated) {
          const programEnrollment = await loaders.AccountProgram.loadByAccountIdAndProgramId(
            user.id,
            parent.id,
          );

          if (programEnrollment && !programEnrollment.deleted_at) {
            return loaders.ProgramVersion.loadById(programEnrollment.program_version_id);
          }
        }

        const programVersions = await loaders.ProgramVersion.loadByProgramId(parent.id);

        if (programVersions.length === 0) {
          throw new GraphQLError(ErrorType.NOT_FOUND);
        }

        const latestPublishedVersion = programVersions
          .filter((version) => version.status === ProgramVersionStatusType.Published)
          .sort((a, b) => b.version_number - a.version_number)[0];

        if (!latestPublishedVersion) {
          throw new GraphQLError(ErrorType.NO_PUBLISHED_PROGRAM_VERSION_FOUND);
        }

        return latestPublishedVersion;
      },
    },
    editableVersion: {
      type: new GraphQLNonNull(ProgramVersion),
      description:
        'The version the owning teacher should edit. Returns the current draft if one exists, otherwise the latest published version.',
      resolve: authenticated(async (parent, _, { user, db }) => {
        if (user.id !== parent.teacher_id) {
          throw new GraphQLError(ErrorType.FORBIDDEN);
        }

        const draftVersion = await db('program_version')
          .where('program_id', parent.id)
          .where('status', ProgramVersionStatusType.Draft)
          .first();

        if (draftVersion) {
          return draftVersion;
        }

        return db('program_version')
          .where('program_id', parent.id)
          .where('status', ProgramVersionStatusType.Published)
          .orderBy('version_number', 'desc')
          .first();
      }),
    },
    latestVersionNumber: {
      type: GraphQLInt,
      description: 'The latest program version number.',
      resolve: async (parent, _, { user, db }) => {
        if (!user.authenticated) {
          return null;
        }

        const latestProgramVersion = await db('program_version')
          .where('program_id', parent.id)
          .where('status', ProgramVersionStatusType.Published)
          .orderBy('version_number', 'desc')
          .first();

        if (!latestProgramVersion) {
          return null;
        }

        return latestProgramVersion.version_number;
      },
    },
    enrolledLearnersCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of learners currently enrolled in this program.',
      resolve: async (parent, _, { loaders }) => {
        const programEnrollments = await loaders.AccountProgram.loadByProgramId(parent.id);

        return programEnrollments.length;
      },
    },
    instructor: {
      type: new GraphQLNonNull(Teacher),
      description: 'The instructor of this program.',
      resolve: async (parent, _, { loaders }) => {
        return loaders.Account.loadById(parent.teacher_id);
      },
    },
  }),
});
