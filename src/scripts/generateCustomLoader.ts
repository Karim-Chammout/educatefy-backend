/**
 * generate-custom-loader
 *
 * Usage:
 *   npm run generate-custom-loader <table_name>
 *
 * Example:
 *   npm run generate-custom-loader subject
 *   npm run generate-custom-loader course_section
 *
 * What it does:
 *   Creates a hand-written extension starter file at
 *   loaders/<ClassName>.ts that extends <ClassName>Base from the
 *   corresponding generated file.
 *
 *   The file is only ever created — never overwritten. If it already
 *   exists the script exits with a clear message so you never
 *   accidentally lose custom work.
 *
 *   After creation, run `npm run generate-loaders` so db/index.ts is
 *   updated to import the new custom file instead of the generated base.
 */

import path from 'path';
import fs from 'fs/promises';
import { execSync } from 'child_process';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const LOADERS_DIR = path.join(__dirname, '..', 'graphql', 'ctx', 'db', 'loaders');

// ---------------------------------------------------------------------------
// Naming helpers
// ---------------------------------------------------------------------------

function toPascalCase(tableName: string): string {
  return tableName
    .split('__')
    .map((part) =>
      part
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(''),
    )
    .join('');
}

// ---------------------------------------------------------------------------
// Starter template
// ---------------------------------------------------------------------------

function buildStarterTemplate(className: string): string {
  return `import DataLoader from 'dataloader';

import { ${className} as ${className}Type } from '../../../../types/db-generated-types';
import { ${className}Base } from './${className}.generated';

export class ${className}Reader extends ${className}Base {
  // Example of a custom loader that joins across a linking table to fetch related records.

  private byAccountIdAndProgramIdLoader: DataLoader<
    { accountId: number; programId: number },
    AccountProgramType
  >;

  constructor(db: ConstructorParameters<typeof AccountProgramBase>[0]) {
    super(db);

    this.byAccountIdAndProgramIdLoader = new DataLoader(async (keys) => {
      if (keys.length === 0) {
        return [];
      }

      const rows = await this.db
        .table('account__program')
        .whereNull('deleted_at')
        .where((builder) =>
          keys.forEach((key) =>
            builder.orWhere({
              account_id: key.accountId,
              program_id: key.programId,
            }),
          ),
        )
        .select()
        .then((results) =>
          keys.map((key) =>
            results.find((x) => x.account_id === key.accountId && x.program_id === key.programId),
          ),
        );

      return rows;
    });
  }

  get loaders() {
    return {
      ...super.loaders,
      byAccountIdAndProgramIdLoader: this.byAccountIdAndProgramIdLoader,
    };
  }

  loadByAccountIdAndProgramId(accountId: number, programId: number): Promise<AccountProgramType> {
    return this.byAccountIdAndProgramIdLoader.load({ accountId, programId });
  }
}
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const tableName = process.argv[2];

  if (!tableName) {
    console.error('Usage: npm run generate-custom-loader <table_name>');
    console.error('Example: npm run generate-custom-loader subject');
    process.exit(1);
  }

  const className = toPascalCase(tableName);
  const customPath = path.join(LOADERS_DIR, `${className}.ts`);
  const generatedPath = path.join(LOADERS_DIR, `${className}.generated.ts`);

  // Make sure the generated base file exists first — the custom file is
  // useless without it
  try {
    await fs.access(generatedPath);
  } catch {
    console.error(`\n  ✘  No generated base found at: ${generatedPath}`);
    console.error(`     Run \`npm run generate-loaders\` first to generate the base file.\n`);
    process.exit(1);
  }

  // Refuse to overwrite an existing custom file
  try {
    await fs.access(customPath);
    console.error(`\n  ✘  Custom loader already exists: ${customPath}`);
    console.error(`     Edit that file directly — this command will never overwrite it.\n`);
    process.exit(1);
  } catch {
    // File does not exist — safe to create
  }

  await fs.writeFile(customPath, buildStarterTemplate(className));

  // Format the new file with prettier
  execSync(`npx prettier --write "${customPath}"`, { stdio: 'inherit' });

  console.log(`\n  ✔  Created: ${customPath}`);
  console.log(`     Now run \`npm run generate-loaders\` to update db/index.ts.\n`);
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
