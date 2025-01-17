export interface Report {
  report_id: string;
  user_wallet_address: string;
  report_type: string;
  description: string;
  timestamp: number;
  status: string;
  admin_notes: string;
}

export type Reports = Array<Report>;

export interface VideoReport {
  report_counts?: number;
  reports: Reports;
}