import { vpc } from "./vpc";

export const database = new sst.aws.Postgres("Database", {
  vpc,
  scaling: {
    min: "0.5 ACU",
    max: "8 ACU",
  },
  databaseName: "easeinventory",
});

// Connection string for services
export const databaseUrl = $interpolate`postgresql://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}`;
