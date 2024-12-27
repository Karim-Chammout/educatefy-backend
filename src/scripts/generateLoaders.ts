import fs from 'fs/promises';
import path from 'path';

function convertToPascalCase(tableName: string) {
  // Handle both single and double underscores
  // First split by double underscores if they exist
  const parts = tableName.split('__');

  // Then handle single underscores within each part and convert to PascalCase
  return parts
    .map((part) =>
      part
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(''),
    )
    .join('');
}

async function generateLoader(tableName: string) {
  // Convert table name to PascalCase
  const className = convertToPascalCase(tableName);

  const template = `import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ${className} as ${className}Type } from '../../../../types/db-generated-types';

export class ${className}Reader {
  private byIdLoader: DataLoader<number, ${className}Type>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<${className}Type>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('${tableName}')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('${tableName}').select();

      for (const row of result) {
        this.byIdLoader.prime(row.id, row);
      }
      return result;
    };
  }

  /**
   * This property exposes the private loaders in order to prime or clear the cache of the loader.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<${className}Type> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<${className}Type | Error>> {
    return this.byIdLoader.loadMany(ids);
  }
}
`;

  // Create the output directory if it doesn't exist
  const outputDir = path.join(__dirname, '..', 'graphql', 'ctx', 'db', 'loaders');
  await fs.mkdir(outputDir, { recursive: true });

  // Define the output path
  const outputPath = path.join(outputDir, `${className}.ts`);

  // Check if file exists
  try {
    await fs.access(outputPath);
    console.log(`File ${outputPath} already exists. Overwriting...`);
  } catch {
    console.log(`Creating new file at ${outputPath}`);
  }

  // Write/overwrite the file
  await fs.writeFile(outputPath, template);
  console.log(
    `Successfully generated/updated loader file for table '${tableName}' at: ${outputPath}`,
  );
}

// Get the table name from command line arguments
const tableName = process.argv[2];

if (!tableName) {
  console.error('Please provide a table name as an argument');
  process.exit(1);
}

generateLoader(tableName).catch(console.error);
