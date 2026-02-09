export const vpc = new sst.aws.Vpc("Vpc", {
  bastion: true, // For SSH access to DB during development
  nat: "managed", // NAT Gateway for Lambda -> internet
});
