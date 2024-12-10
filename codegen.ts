import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  generates: {
    './src/types/schema-types.ts': {
      plugins: ['typescript'],
    },
  },
};

export default config;
