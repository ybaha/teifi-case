import { GraphQLClient } from "graphql-request";

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN as string;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN as string;

export const shopifyClient = new GraphQLClient(
  `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/graphql.json`,
  {
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
  }
);
