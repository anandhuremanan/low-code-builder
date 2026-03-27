export type Application = {
  application_id: string;
  application_name: string;
  application_description: string;
  created_at: string;
  modified_at: string;
  is_active: boolean;
};

export type DashboardLoaderData = {
  data: Application[];
  success: boolean;
};

export type DashboardActionData = {
  success?: boolean;
  error?: string;
};
