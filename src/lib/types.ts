export type RequestDto = {
  id: string;
  requestCode: string;
  employeeName: string;
  employeeEmail: string;
  subject: string;
  description: string;
  department: "HR" | "IT" | "PAYROLL" | "OPERATIONS" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "ACTIVE" | "FINALIZED";
  assignedTo: {
    id: string;
    name: string;
    email: string;
    department: string | null;
  } | null;
  slaFirstResponseAt: string | null;
  slaDeadline: string;
  slaBreached: boolean;
  escalatedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  sla: {
    firstResponseRemainingMs: number | null;
    resolutionRemainingMs: number;
    breached: boolean;
  };
  history: {
    id: string;
    action: string;
    detail: string | null;
    createdAt: string;
    performedBy: { id: string; name: string; email: string } | null;
  }[];
};

export type DashboardStats = {
  total: number;
  open: number;
  active: number;
  finalized: number;
  slaBreaches: number;
  departments: Record<string, number>;
};
