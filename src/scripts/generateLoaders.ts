/**
 * generate-loaders
 *
 * Usage:
 *   npm run generate-loaders
 *
 * What it does:
 *   1. Introspects the live PostgreSQL schema via Knex to discover every table.
 *   2. For each table it reads the column list AND unique constraints so it
 *      can generate smart loaders:
 *        - FK (*_id) columns with a single-column UNIQUE constraint → one-to-one (mapTo)
 *        - FK (*_id) columns in composite UNIQUE or no constraint   → one-to-many (mapToMany)
 *        - Named columns in NAMED_COLUMN_LOADERS (e.g. email, slug) → always one-to-one (mapTo)
 *        - `deleted_at` present → every query gets .whereNull('deleted_at')
 *   3. Writes / overwrites  loaders/<ClassName>.generated.ts  for every table.
 *   4. For tables that already have a hand-written  loaders/<ClassName>.ts  it
 *      leaves that file completely untouched.
 *   5. Fully regenerates  graphql/ctx/db/index.ts  (the barrel that wires
 *      every reader into `createLoaders`).
 *   6. Runs `prettier --write` on every file it touches so the output is
 *      always clean without any manual formatting step.
 *
 * Hand-written extension files:
 *   If you need custom loaders for a table, create  loaders/<ClassName>.ts
 *   that extends  <ClassName>Base  from the generated file.  The generator
 *   will never touch that file.  Use `npm run generate-custom-loader <table>`
 *   to scaffold the starter file.
 *
 * The map helpers (mapTo / mapToMany) live in  loaders/map.ts  and are
 * imported by every generated file that needs them.
 */

import path from 'path';
import fs from 'fs/promises';
import { execSync } from 'child_process';

import { db } from '../db/index';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const LOADERS_DIR = path.join(__dirname, '..', 'graphql', 'ctx', 'db', 'loaders');
const DB_INDEX_PATH = path.join(__dirname, '..', 'graphql', 'ctx', 'db', 'index.ts');

// ---------------------------------------------------------------------------
// Tables to exclude from loader generation.
// ---------------------------------------------------------------------------

const IGNORED_TABLES = ['migrations', 'migrations_lock'];

// ---------------------------------------------------------------------------
// Named columns that always get a one-to-one loader generated when present
// on any table, regardless of whether a DB constraint exists.
//
// These are columns that are unique by convention (email, slug, code, etc.)
// but may not always have a formal UNIQUE constraint in the schema.
// ---------------------------------------------------------------------------

const NAMED_COLUMN_LOADERS = ['email', 'slug', 'code'];

// ---------------------------------------------------------------------------
// Schema introspection
// ---------------------------------------------------------------------------

interface ColumnInfo {
  column_name: string;
  data_type: string;
}

/** Returns all user-created table names, excluding any in IGNORED_TABLES. */
async function getAllTables(): Promise<string[]> {
  const rows = await db('information_schema.tables')
    .select('table_name')
    .where('table_schema', 'public')
    .where('table_type', 'BASE TABLE')
    .whereNotIn('table_name', IGNORED_TABLES)
    .orderBy('table_name');

  return rows.map((r: { table_name: string }) => r.table_name);
}

/** Returns column metadata for a given table. */
async function getColumns(tableName: string): Promise<ColumnInfo[]> {
  return db('information_schema.columns')
    .select('column_name', 'data_type')
    .where('table_schema', 'public')
    .where('table_name', tableName)
    .orderBy('ordinal_position');
}

/**
 * Returns the set of column names that are the SOLE column in a UNIQUE or
 * PRIMARY KEY constraint on the given table.
 *
 * A composite unique constraint such as UNIQUE(program_id, course_id) does NOT
 * make either column individually unique, so neither column is included in the
 * returned set. Only single-column constraints qualify, because only those
 * guarantee that a query by that column returns at most one row (one-to-one).
 */
async function getUniqueColumns(tableName: string): Promise<Set<string>> {
  const result = await db.raw<{ rows: { column_name: string }[] }>(
    `
    SELECT kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON  tc.constraint_name = kcu.constraint_name
      AND tc.table_schema    = kcu.table_schema
    JOIN (
      -- Count columns per constraint so we can filter out composite ones.
      SELECT constraint_name, table_schema, COUNT(*) AS col_count
      FROM   information_schema.key_column_usage
      WHERE  table_schema = 'public'
        AND  table_name   = :tableName
      GROUP  BY constraint_name, table_schema
    ) AS sizes
      ON  tc.constraint_name = sizes.constraint_name
      AND tc.table_schema    = sizes.table_schema
    WHERE tc.table_schema     = 'public'
      AND tc.table_name       = :tableName
      AND tc.constraint_type  IN ('UNIQUE', 'PRIMARY KEY')
      AND sizes.col_count     = 1
    `,
    { tableName },
  );

  return new Set(result.rows.map((r) => r.column_name));
}

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

/** teacher_id → teacherId */
function toCamelCase(snake: string): string {
  const parts = snake.split('_');
  return (
    parts[0] +
    parts
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')
  );
}

/** teacher_id → TeacherId */
function columnToPascal(columnName: string): string {
  return columnName
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

// ---------------------------------------------------------------------------
// PostgreSQL data_type → TypeScript primitive
// ---------------------------------------------------------------------------

function pgTypeToTs(dataType: string): string {
  switch (dataType) {
    case 'integer':
    case 'bigint':
    case 'smallint':
    case 'numeric':
    case 'real':
    case 'double precision':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return 'string';
  }
}

// ---------------------------------------------------------------------------
// Code generation — .generated.ts
// ---------------------------------------------------------------------------

interface LoaderField {
  columnName: string; // e.g. "teacher_id" or "email"
  camelColumn: string; // e.g. "teacherId"  or "email"
  pascalColumn: string; // e.g. "TeacherId"  or "Email"
  tsType: string; // e.g. "number"     or "string"
  isUnique: boolean; // true → one-to-one (mapTo), false → one-to-many (mapToMany)
}

function buildGeneratedFile(
  tableName: string,
  className: string,
  columns: ColumnInfo[],
  uniqueColumns: Set<string>,
): string {
  const hasSoftDelete = columns.some((c) => c.column_name === 'deleted_at');
  const softDeleteFilter = hasSoftDelete ? `\n        .whereNull('deleted_at')` : '';

  // ── FK loaders (*_id columns, excluding the PK `id`) ───────────────────
  // isUnique is determined by the DB constraint introspection.
  const fkLoaders: LoaderField[] = columns
    .filter((c) => c.column_name.endsWith('_id') && c.column_name !== 'id')
    .map((c) => ({
      columnName: c.column_name,
      camelColumn: toCamelCase(c.column_name),
      pascalColumn: columnToPascal(c.column_name),
      tsType: pgTypeToTs(c.data_type),
      isUnique: uniqueColumns.has(c.column_name),
    }));

  // ── Named loaders (email, slug, code, etc.) ─────────────────────────────
  // Always one-to-one regardless of DB constraints — these are unique by
  // convention. Only generated when the column actually exists on this table.
  const namedLoaders: LoaderField[] = columns
    .filter((c) => NAMED_COLUMN_LOADERS.includes(c.column_name))
    .map((c) => ({
      columnName: c.column_name,
      camelColumn: toCamelCase(c.column_name),
      pascalColumn: columnToPascal(c.column_name),
      tsType: pgTypeToTs(c.data_type),
      isUnique: true, // always one-to-one
    }));

  // All loaders combined — FK loaders first, then named loaders
  const allLoaders: LoaderField[] = [...fkLoaders, ...namedLoaders];

  const needsMapToMany = fkLoaders.some((fk) => !fk.isUnique);

  // mapTo is always used (byIdLoader + named loaders).
  // mapToMany is only imported when at least one FK loader is one-to-many.
  const mapImports = ['mapTo', ...(needsMapToMany ? ['mapToMany'] : [])].join(', ');

  // ── private field declarations ──────────────────────────────────────────
  const privateFields = allLoaders
    .map((l) => {
      const returnType = l.isUnique ? `${className}Type` : `ReadonlyArray<${className}Type>`;
      return `  private by${l.pascalColumn}Loader: DataLoader<${l.tsType}, ${returnType}>;`;
    })
    .join('\n\n');

  // ── constructor body ────────────────────────────────────────────────────
  const constructorBlocks = allLoaders
    .map((l) => {
      const mapFn = l.isUnique
        ? `mapTo(${l.camelColumn}s, rows, (r) => r.${l.columnName})`
        : `mapToMany(${l.camelColumn}s, rows, (r) => r.${l.columnName})`;

      return `
    this.by${l.pascalColumn}Loader = new DataLoader(async (${l.camelColumn}s) => {
      if (${l.camelColumn}s.length === 0) return [];

      const rows = await db
        .table('${tableName}')
        .whereIn('${l.columnName}', ${l.camelColumn}s)${softDeleteFilter}
        .select();

      return ${mapFn};
    });`;
    })
    .join('\n');

  // ── loaders getter entries ──────────────────────────────────────────────
  const getterEntries = allLoaders
    .map((l) => `      by${l.pascalColumn}Loader: this.by${l.pascalColumn}Loader,`)
    .join('\n');

  // ── public load methods ─────────────────────────────────────────────────
  const loadMethods = allLoaders
    .map((l) => {
      const returnType = l.isUnique
        ? `Promise<${className}Type>`
        : `Promise<ReadonlyArray<${className}Type>>`;
      const jsdoc = l.isUnique
        ? `/** Load the ${className} record with ${l.columnName} = \`${l.camelColumn}\` */`
        : `/** Load all ${className} records with ${l.columnName} = \`${l.camelColumn}\` */`;

      return `
  ${jsdoc}
  loadBy${l.pascalColumn}(${l.camelColumn}: ${l.tsType}): ${returnType} {
    return this.by${l.pascalColumn}Loader.load(${l.camelColumn});
  }`;
    })
    .join('\n');

  return `// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create \`${className}.ts\` in this directory
// and extend \`${className}Base\`. The generator will never overwrite that file.
// Re-run \`npm run generate-loaders\` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ${className} as ${className}Type } from '../../../../types/db-generated-types';
import { ${mapImports} } from './map';

export class ${className}Base {
  private byIdLoader: DataLoader<number, ${className}Type>;
${privateFields ? '\n' + privateFields + '\n' : ''}
  loadAll: () => Promise<ReadonlyArray<${className}Type>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db
        .table('${tableName}')
        .whereIn('id', ids)${softDeleteFilter}
        .select();

      return mapTo(ids, rows, (r) => r.id);
    });
${constructorBlocks}

    this.loadAll = async () => {
      const result = await db
        .table('${tableName}')${softDeleteFilter}
        .select();

      for (const row of result) {
        this.byIdLoader.prime(row.id, row);
      }

      return result;
    };
  }

  /**
   * Exposes the underlying DataLoader instances so callers can prime or
   * clear the cache directly when needed.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
${getterEntries}
    };
  }

  /** Load a single ${className} by its primary key */
  loadById(id: number): Promise<${className}Type> {
    return this.byIdLoader.load(id);
  }

  /** Load many ${className} records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<${className}Type | Error>> {
    return this.byIdLoader.loadMany(ids);
  }
${loadMethods}
}
`;
}

// ---------------------------------------------------------------------------
// Code generation — db/index.ts barrel
// ---------------------------------------------------------------------------

interface ReaderEntry {
  className: string;
  hasCustomFile: boolean;
}

function buildDbIndex(entries: ReaderEntry[]): string {
  const sorted = [...entries].sort((a, b) => a.className.localeCompare(b.className));

  const imports = sorted
    .map(({ className, hasCustomFile }) => {
      if (hasCustomFile) {
        return `import { ${className}Reader } from './loaders/${className}';`;
      }
      return `import { ${className}Base as ${className}Reader } from './loaders/${className}.generated';`;
    })
    .join('\n');

  const typeBody = sorted.map(({ className }) => `  ${className}: ${className}Reader;`).join('\n');

  const factoryBody = sorted
    .map(({ className }) => `    ${className}: new ${className}Reader(db),`)
    .join('\n');

  return `// ⚠️  This file is auto-generated. Do NOT edit it manually.
// Re-run \`npm run generate-loaders\` to regenerate it.

import { Knex } from 'knex';

${imports}

export type ReadersType = {
${typeBody}
};

export function createLoaders(db: Knex): ReadersType {
  return {
${factoryBody}
  };
}
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await fs.mkdir(LOADERS_DIR, { recursive: true });

  const tables = await getAllTables();

  if (tables.length === 0) {
    console.error(
      'No tables found. Make sure your database is running and migrations are applied.',
    );
    process.exit(1);
  }

  console.log(`Found ${tables.length} tables. Generating loaders...\n`);

  const entries: ReaderEntry[] = [];
  const formattedPaths: string[] = [];

  for (const tableName of tables) {
    const className = toPascalCase(tableName);

    const [columns, uniqueColumns] = await Promise.all([
      getColumns(tableName),
      getUniqueColumns(tableName),
    ]);

    // Always overwrite the generated base file
    const generatedPath = path.join(LOADERS_DIR, `${className}.generated.ts`);
    await fs.writeFile(
      generatedPath,
      buildGeneratedFile(tableName, className, columns, uniqueColumns),
    );
    formattedPaths.push(generatedPath);
    console.log(`  ✔  ${className}.generated.ts`);

    // Check for a hand-written extension file — never touch it
    const customPath = path.join(LOADERS_DIR, `${className}.ts`);
    let hasCustomFile = false;
    try {
      await fs.access(customPath);
      hasCustomFile = true;
      console.log(`  ·  ${className}.ts (custom — skipped)`);
    } catch {
      // no custom file — barrel will import the generated base directly
    }

    entries.push({ className, hasCustomFile });
  }

  // Rebuild the barrel
  await fs.writeFile(DB_INDEX_PATH, buildDbIndex(entries));
  formattedPaths.push(DB_INDEX_PATH);
  console.log(`\n  ✔  db/index.ts rebuilt (${entries.length} readers)`);

  // Format all written files with prettier in one pass
  console.log('\n  Running prettier...');
  const pathArgs = formattedPaths.map((p) => `"${p}"`).join(' ');
  execSync(`npx prettier --write ${pathArgs}`, { stdio: 'inherit' });
  console.log('  ✔  All files formatted\n');

  await db.destroy();
}

main().catch(async (err) => {
  console.error(err);
  await db.destroy();
  process.exit(1);
});
