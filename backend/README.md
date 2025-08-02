# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file

Then you can use the following commands:

- `npm run build` - Builds the project
- `npm start` - Runs the built version (production)
- `npm run dev` - Runs development version with hot reload
- `npm run migration:generate` - Generates new migrations
- `npm run migration:run` - Runs pending migrations
- `npm run migration:revert` - Reverts last migration

## migration

- to generate a migration

```sh
  npm run typeorm:generate-migration --name=<name of the migration>
```

- to apply migration.

```sh
  npm run typeorm:run-migrations
```
