// JWT Authorizer will be used when extracting microservices
// For now, authentication is handled by NextAuth.js inside Next.js

export const AUTH_CONFIG = {
  issuer: "https://easeinventory.com",
  audiences: ["https://api.easeinventory.com"],
};
