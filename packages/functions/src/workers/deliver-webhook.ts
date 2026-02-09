import type { SQSEvent } from "aws-lambda";

export async function handler(event: SQSEvent) {
  for (const record of event.Records) {
    const payload = JSON.parse(record.body);
    console.log("Delivering webhook:", payload.url, payload.eventType);

    // TODO: Import webhook delivery logic from WebhookService
    // - POST to endpoint URL with HMAC signature
    // - Record delivery attempt
    // - Handle retry on failure
  }
}
