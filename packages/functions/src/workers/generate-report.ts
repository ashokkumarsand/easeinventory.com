import type { SQSEvent } from "aws-lambda";

export async function handler(event: SQSEvent) {
  for (const record of event.Records) {
    const payload = JSON.parse(record.body);
    console.log("Generating report:", payload.reportId);

    // TODO: Import ReportService and generate CSV/Excel
    // - Query data based on report config
    // - Generate file (CSV or Excel)
    // - Upload to S3
    // - Notify user (email or in-app)
  }
}
