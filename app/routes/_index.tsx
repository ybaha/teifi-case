import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
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
  Icon,
} from "@shopify/polaris";
import { FormEvent, useState } from "react";
import { FormStatus, FormValues } from "~/types";
import { PAGE_SIZE } from "~/utils/constants";
import {
  getProducts,
  createProduct,
  updateVariant,
  deleteProduct,
} from "~/utils/shopify.server";
import { DeleteIcon } from "@shopify/polaris-icons";

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

  const data = await getProducts(PAGE_SIZE, cursor, direction === "previous");

  return Response.json({
    products: data.products.nodes,
    hasNextPage: data.products.pageInfo.hasNextPage,
    hasPreviousPage: data.products.pageInfo.hasPreviousPage,
    endCursor: data.products.pageInfo.endCursor,
    startCursor: data.products.pageInfo.startCursor,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "delete") {
      const productId = formData.get("productId") as string;
      await deleteProduct(productId);
      return Response.json({ success: true });
    }

    const title = formData.get("title") as string;
    const status = formData.get("status") as string;
    const sku = formData.get("sku") as string;

    const data = await createProduct({ title, status });

    // i couldn't find a way to add a sku to the product when creating it
    // so i'm updating the first variant with the sku
    // not sure if this is the correct way to do it
    if (sku && data.productCreate.product.variants.nodes[0]) {
      await updateVariant(data.productCreate.product.variants.nodes[0].id, sku);
    }

    return Response.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return new Response(errorMessage, { status: 400 });
  }
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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const rows = products.map((product) => [
    product.title,
    product.status,
    product.variants.nodes[0]?.barcode || "",
    <div
      style={{ display: "flex", justifyContent: "flex-end" }}
      key={product.id}
    >
      <Button
        icon={<Icon source={DeleteIcon} />}
        onClick={() => {
          setProductToDelete(product.id);
          setDeleteModalOpen(true);
        }}
        tone="critical"
        variant="primary"
      />
    </div>,
  ]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", formValues.title);
    formData.append("status", formValues.status);
    formData.append("sku", formValues.sku);

    submit(formData, { method: "post" });

    setIsModalOpen(false);
    setFormValues({ title: "", status: "ACTIVE", sku: "" }); // Reset form
  };

  const handleDelete = () => {
    if (!productToDelete) return;

    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("productId", productToDelete);

    submit(formData, { method: "post" });
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

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
            columnContentTypes={["text", "text", "text", "text"]}
            headings={["Title", "Status", "SKU", "Actions"]}
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
            <Form onSubmit={handleSubmit}>
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

        <Modal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setProductToDelete(null);
          }}
          title="Delete product"
        >
          <Modal.Section>
            <p>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
              <Button
                tone="critical"
                variant="primary"
                onClick={handleDelete}
                loading={isLoading}
              >
                Delete
              </Button>
            </div>
          </Modal.Section>
        </Modal>
      </Page>
    </Frame>
  );
}
