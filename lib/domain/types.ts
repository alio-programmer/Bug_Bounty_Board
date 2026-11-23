import type {
  BugStatus,
  Category,
  Effort,
  Severity,
} from "./constants";

export interface Bug {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  effort: Effort;
  category: Category;
  status: BugStatus;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BugInput {
  title: string;
  description?: string;
  severity: Severity;
  effort: Effort;
  category?: Category;
  status?: BugStatus;
  reportedBy?: string;
}
