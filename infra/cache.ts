import { vpc } from "./vpc";

export const cache = new sst.aws.Redis("Cache", {
  vpc,
});

export const cacheUrl = $interpolate`rediss://${cache.host}:${cache.port}`;
