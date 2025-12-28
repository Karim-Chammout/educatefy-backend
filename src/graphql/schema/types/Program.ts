import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Program as ProgramType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { getImageURL } from '../../../utils/getImageURL';
import GraphQLDate from '../Scalars/Date';
import ProgramLevel from './enum/ProgramLevel';
import { ProgramObjective } from './ProgramObjective';
import { ProgramRequirement } from './ProgramRequirement';
import { Subject } from './Subject';

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
    external_resource_link: {
      type: GraphQLString,
      description: 'A link to an external resource.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this program is published or not',
    },
    image: {
      type: GraphQLString,
      description: 'The image of this program',
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
  }),
});
