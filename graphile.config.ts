import { makePgService } from "@dataplan/pg/adaptors/pg";
import { PostGraphileAmberPreset } from "postgraphile/presets/amber";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import { default as PersistedPlugin } from "@grafserv/persisted";
import { FooSubscriptionPlugin } from "./FooSubscriptionPlugin.js";

// For configuration file details, see: https://postgraphile.org/postgraphile/next/config

console.log('ENV', process.env.DATABASE_URL, process.env.DATABASE_SCHEMAS);

export const preset: GraphileConfig.Preset = {
  extends: [
    PostGraphileAmberPreset,
    PostGraphileConnectionFilterPreset,
    PgSimplifyInflectionPreset,
    PgAggregatesPreset,
  ],
  plugins: [
    PersistedPlugin,
    FooSubscriptionPlugin
  ],
  pgServices: [
    makePgService({
      // Database connection string:
      connectionString: process.env.DATABASE_URL,
      // List of schemas to expose:
      schemas: process.env.DATABASE_SCHEMAS?.split(",") ?? ["public"],
      // Enable LISTEN/NOTIFY:
      pubsub: true,
    }),
  ],
  grafserv: {
    port: 5678,
    websockets: true,
    allowUnpersistedOperation: true,
    maskError(err) {
      console.log('We expect the foo subscription error to land here before being dumped to the front-end', err);
      return new GraphQLError('Sanitized output');
    }
  },
  grafast: {
    explain: true,
  },
};
