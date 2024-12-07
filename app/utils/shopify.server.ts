import { GraphQLClient } from "graphql-request";

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN as string;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN as string;

interface ProductsResponse {
  products: {
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    nodes: Array<{
      id: string;
      title: string;
      status: string;
      variants: {
        nodes: Array<{
          id: string;
          barcode: string;
        }>;
      };
    }>;
  };
}

interface ProductCreateResponse {
  productCreate: {
    product: {
      id: string;
      variants: {
        nodes: Array<{
          id: string;
        }>;
      };
    };
  };
}

export const shopifyClient = new GraphQLClient(
  `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/graphql.json`,
  {
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
  }
);

export const queries = {
  getProducts: `
    query getProducts($first: Int, $last: Int, $after: String, $before: String) {
      products(first: $first, last: $last, after: $after, before: $before) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        nodes {
          id
          title
          status
          variants(first: 1) {
            nodes {
              id
              barcode
            }
          }
        }
      }
    }
  `,

  createProduct: `
    mutation createProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          variants(first: 1) {
            nodes {
              id
            }
          }
        }
      }
    }
  `,

  updateVariant: `
    mutation updateVariant($input: ProductVariantInput!) {
      productVariantUpdate(input: $input) {
        productVariant {
          id
          barcode
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
};

export async function getProducts(
  limit: number,
  cursor?: string,
  reverse = false
) {
  return shopifyClient.request<ProductsResponse>(queries.getProducts, {
    first: reverse ? undefined : limit,
    last: reverse ? limit : undefined,
    after: !reverse ? cursor : undefined,
    before: reverse ? cursor : undefined,
  });
}

export async function createProduct(input: {
  title: string;
  status: string;
  sku?: string;
}) {
  return shopifyClient.request<ProductCreateResponse>(queries.createProduct, {
    input,
  });
}

export async function updateVariant(id: string, sku: string) {
  return shopifyClient.request(queries.updateVariant, {
    input: {
      id,
      barcode: sku,
    },
  });
}
