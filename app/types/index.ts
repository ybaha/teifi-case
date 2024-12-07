export type FormStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";
export type FormValues = {
  title: string;
  status: FormStatus;
  sku: string;
};
