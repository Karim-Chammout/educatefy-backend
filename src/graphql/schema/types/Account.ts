import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { FileType } from '../../../enum/fileType';
import { Account as AccountType, Country as CountryType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { getImageURL } from '../../../utils/getImageURL';
import GraphQLDate from '../Scalars/Date';
import { Country } from './Country';
import AccountRole from './enum/AccountRole';
import Gender from './enum/Gender';

export const Account = new GraphQLObjectType<AccountType, ContextType>({
  name: 'Account',
  description: 'The properties of the account',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this account',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the account',
    },
    nickname: {
      type: GraphQLString,
      description: 'The nickname of the account',
    },
    first_name: {
      type: GraphQLString,
      description: 'The first name of the account',
    },
    last_name: {
      type: GraphQLString,
      description: 'The last name of the account',
    },
    gender: {
      type: Gender,
      description: 'The gender of the account',
    },
    date_of_birth: {
      type: GraphQLDate,
      description: 'The date of birth of this account',
    },
    avatar_url: {
      type: GraphQLString,
      description: 'The avatar url of this account (provided by the openid-provider)',
      resolve: async (parent, _, { user, loaders }) => {
        if (!user.authenticated) return null;

        if (parent.avatar_url) return getImageURL(parent.avatar_url);

        return null;
      },
    },
    country: {
      type: Country,
      description: 'The current country the user stated to live in.',
      resolve: async (parent, _, { loaders }): Promise<CountryType | null> => {
        if (!parent.country_id) {
          return null;
        }

        const country = await loaders.Country.loadById(parent.country_id);

        if (!country) {
          return null;
        }

        return country;
      },
    },
    nationality: {
      type: Country,
      description: 'The nationality of the user',
      resolve: async (parent, _, { loaders }): Promise<CountryType | null> => {
        if (!parent.nationality_id) {
          return null;
        }

        const nationality = await loaders.Country.loadById(parent.nationality_id);

        if (!nationality) {
          return null;
        }

        return nationality;
      },
    },
    preferredLanguage: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The preferred language for the account',
      resolve: async (parent, _, { loaders }) => {
        const language = await loaders.Language.loadById(parent.preferred_language_id);

        return language.code;
      },
    },
    accountRole: {
      type: new GraphQLNonNull(AccountRole),
      description: 'The role of the account.',
      resolve: async (parent, _, { loaders }): Promise<string> => {
        const role = await loaders.AccountRole.loadById(parent.role_id);

        return role.code;
      },
    },
    specialty: {
      type: GraphQLString,
      description: 'Represents the subject a teacher is specialized in for teaching.',
    },
    bio: {
      type: GraphQLString,
      description: 'The bio of the teacher.',
    },
    description: {
      type: GraphQLString,
      description: 'A detailed overview about this teacher.',
    },
  }),
});
