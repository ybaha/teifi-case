import { type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Card,
  DataTable,
  Pagination,
  Button,
  Modal,
  Form,
  FormLayout,
  TextField,
  Select,
  Loading,
  Frame,
} from "@shopify/polaris";
import { useState } from "react";
import { getProducts } from "~/utils/shopify.server";

interface LoaderData {
  products: Array<{
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
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor: string;
  startCursor: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor") || undefined;
  const direction = url.searchParams.get("direction") || "next";

  const data = await getProducts(5, cursor, direction === "previous");

  return Response.json({
    products: data.products.nodes,
    hasNextPage: data.products.pageInfo.hasNextPage,
    hasPreviousPage: data.products.pageInfo.hasPreviousPage,
    endCursor: data.products.pageInfo.endCursor,
    startCursor: data.products.pageInfo.startCursor,
  });
};

type FormStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

type FormValues = {
  title: string;
  status: FormStatus;
  sku: string;
};

export default function Index() {
  const { products, hasNextPage, hasPreviousPage, endCursor, startCursor } =
    useLoaderData<LoaderData>();

  const navigation = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    title: "",
    status: "ACTIVE",
    sku: "",
  });

  const submit = useSubmit();

  const isLoading = navigation.state !== "idle";

  const rows = products.map((product) => [
    product.title,
    product.status,
    product.variants.nodes[0]?.barcode || "",
  ]);

  return (
    <Frame>
      {isLoading && <Loading />}
      <Page
        title="Products"
        primaryAction={
          <Button onClick={() => setIsModalOpen(true)} disabled={isLoading}>
            Add product
          </Button>
        }
      >
        <Card padding="0">
          <DataTable
            columnContentTypes={["text", "text", "text"]}
            headings={["Title", "Status", "SKU"]}
            rows={rows}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "4px 8px",
            }}
          >
            <Pagination
              hasNext={hasNextPage}
              hasPrevious={hasPreviousPage}
              onPrevious={() => {
                if (isLoading) return;
                submit(
                  { cursor: startCursor, direction: "previous" },
                  { method: "get" }
                );
              }}
              onNext={() => {
                if (isLoading) return;
                submit(
                  { cursor: endCursor, direction: "next" },
                  { method: "get" }
                );
              }}
            />
          </div>
        </Card>

        <Modal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormValues({ title: "", status: "ACTIVE", sku: "" });
          }}
          title="Add new product"
        >
          <Modal.Section>
            <Form onSubmit={() => {}}>
              <FormLayout>
                <TextField
                  label="Title"
                  value={formValues.title}
                  onChange={(value) =>
                    setFormValues((prev) => ({ ...prev, title: value }))
                  }
                  autoComplete="off"
                  disabled={isLoading}
                />
                <Select
                  label="Status"
                  value={formValues.status}
                  onChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      status: value as FormStatus,
                    }))
                  }
                  options={[
                    { label: "Active", value: "ACTIVE" },
                    { label: "Draft", value: "DRAFT" },
                    { label: "Archived", value: "ARCHIVED" },
                  ]}
                  disabled={isLoading}
                />
                <TextField
                  label="SKU"
                  value={formValues.sku}
                  onChange={(value) =>
                    setFormValues((prev) => ({ ...prev, sku: value }))
                  }
                  autoComplete="off"
                  disabled={isLoading}
                />
                <Button submit disabled={isLoading}>
                  Create product
                </Button>
              </FormLayout>
            </Form>
          </Modal.Section>
        </Modal>
      </Page>
    </Frame>
  );
}
