'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const projectRoot = path.resolve(__dirname, '..');
const migrationPath = path.join(projectRoot, 'migrations');
const modelPath = path.join(projectRoot, 'src', 'models');
const tables = new Map();
const destructiveUp = [];

function normalizeType(type) {
  const key = type?.key || type?.constructor?.key;
  if (key === 'STRING') return 'VARCHAR(255)';
  if (key === 'DATE') return 'TIMESTAMP WITH TIME ZONE';
  if (key === 'DATEONLY') return 'DATE';
  const rendered = type?.toString();
  if (rendered === 'STRING') return 'VARCHAR(255)';
  if (rendered === 'DATE') return 'TIMESTAMP WITH TIME ZONE';
  if (rendered === 'DATEONLY') return 'DATE';
  return rendered;
}

const queryInterface = {
  sequelize: {
    async transaction() {
      return { async commit() {}, async rollback() {} };
    },
  },
  async createTable(table, columns) {
    tables.set(table, new Map(Object.entries(columns)));
  },
  async dropTable(table) {
    tables.delete(table);
  },
  async addColumn(table, column, definition) {
    if (!tables.has(table)) throw new Error(`Missing table ${table}`);
    tables.get(table).set(column, definition);
  },
  async removeColumn(table, column) {
    if (!tables.has(table)) throw new Error(`Missing table ${table}`);
    tables.get(table).delete(column);
  },
  async describeTable(table) {
    if (!tables.has(table)) throw new Error(`Missing table ${table}`);
    return Object.fromEntries(tables.get(table));
  },
  async bulkDelete(table) {
    destructiveUp.push(table);
  },
  async addConstraint() {},
  async removeConstraint() {},
};

async function main() {
  const migrations = fs
    .readdirSync(migrationPath)
    .filter((file) => file.endsWith('.js'))
    .sort();
  const loadedMigrations = [];
  for (const migrationName of migrations) {
    const migration = require(path.join(migrationPath, migrationName));
    loadedMigrations.push({ migrationName, migration });
    await migration.up(queryInterface, Sequelize);
  }

  const sequelize = new Sequelize(
    'elluria_test',
    'elluria_test_user',
    'test-only',
    {
      host: '127.0.0.1',
      port: 55432,
      dialect: 'postgres',
      logging: false,
    },
  );
  const models = fs
    .readdirSync(modelPath)
    .filter((file) => file.endsWith('.js'))
    .sort();
  const differences = [];

  for (const modelFile of models) {
    const model = require(path.join(modelPath, modelFile))(
      sequelize,
      DataTypes,
    );
    const table = model.getTableName();
    const tableName = typeof table === 'string' ? table : table.tableName;
    const modelColumns = new Set(Object.keys(model.rawAttributes));
    const migrationColumns = tables.get(tableName);
    if (!migrationColumns) {
      differences.push({
        table: tableName,
        issue: 'model-without-migrated-table',
      });
      continue;
    }
    const onlyModel = [...modelColumns]
      .filter((column) => !migrationColumns.has(column))
      .sort();
    const onlyMigration = [...migrationColumns.keys()]
      .filter((column) => !modelColumns.has(column))
      .sort();
    const definitionDifferences = [];
    for (const column of [...modelColumns].filter((name) =>
      migrationColumns.has(name),
    )) {
      const modelDefinition = model.rawAttributes[column];
      const migrationDefinition = migrationColumns.get(column);
      const modelAllowsNull = modelDefinition.allowNull !== false;
      const migrationAllowsNull = migrationDefinition.allowNull !== false;
      const modelType = normalizeType(modelDefinition.type);
      const migrationType = normalizeType(migrationDefinition.type);
      if (
        modelAllowsNull !== migrationAllowsNull ||
        modelType !== migrationType
      ) {
        definitionDifferences.push({
          column,
          model: { type: modelType, allowNull: modelAllowsNull },
          migration: { type: migrationType, allowNull: migrationAllowsNull },
        });
      }
    }
    if (
      onlyModel.length ||
      onlyMigration.length ||
      definitionDifferences.length
    ) {
      differences.push({
        table: tableName,
        onlyModel,
        onlyMigration,
        definitionDifferences,
      });
    }
  }

  const migratedTableCount = tables.size;

  let staticDownResult = { completed: true, count: 0 };
  for (const { migrationName, migration } of [...loadedMigrations].reverse()) {
    try {
      await migration.down(queryInterface, Sequelize);
      staticDownResult.count += 1;
    } catch (error) {
      staticDownResult = {
        ...staticDownResult,
        completed: false,
        firstFailure: migrationName,
        reason: error.message,
      };
      break;
    }
  }

  console.log(
    JSON.stringify(
      {
        migrationCount: migrations.length,
        migrationOrder: migrations,
        migratedTableCount,
        destructiveUpTables: destructiveUp,
        differences,
        staticDownResult,
      },
      null,
      2,
    ),
  );
  await sequelize.close();
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
