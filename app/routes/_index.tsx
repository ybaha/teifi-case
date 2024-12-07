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
  Frame,
} from "@shopify/polaris";
import { useState } from "react";

type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

type FormValues = {
  title: string;
  status: ProductStatus;
  sku: string;
};

export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    title: "",
    status: "ACTIVE",
    sku: "",
  });

  const rows = [
    ["Red T-Shirt", "ACTIVE", "RTS001"],
    ["Blue T-Shirt", "DRAFT", "BTS001"],
    ["Green T-Shirt", "ARCHIVED", "GTS001"],
  ];

  return (
    <Frame>
      <Page
        title="Products"
        primaryAction={
          <Button onClick={() => setIsModalOpen(true)}>Add product</Button>
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
            <Pagination />
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
            <Form
              onSubmit={() => {
                // TODO: Handle form submission
              }}
            >
              <FormLayout>
                <TextField
                  label="Title"
                  value={formValues.title}
                  onChange={(value) =>
                    setFormValues((prev) => ({ ...prev, title: value }))
                  }
                  autoComplete="off"
                />
                <Select
                  label="Status"
                  value={formValues.status}
                  onChange={() => {}}
                  options={[
                    { label: "Active", value: "ACTIVE" },
                    { label: "Draft", value: "DRAFT" },
                    { label: "Archived", value: "ARCHIVED" },
                  ]}
                />
                <TextField
                  label="SKU"
                  value={formValues.sku}
                  onChange={(value) =>
                    setFormValues((prev) => ({ ...prev, sku: value }))
                  }
                  autoComplete="off"
                />
                <Button submit>Create product</Button>
              </FormLayout>
            </Form>
          </Modal.Section>
        </Modal>
      </Page>
    </Frame>
  );
}
