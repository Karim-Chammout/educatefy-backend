import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  generates: {
    './src/types/schema-types.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          Date: 'string | Date',
          JSON: 'Record<string, unknown>',
        },
        strictScalars: true,
      },
    },
  },
};

export default config;
