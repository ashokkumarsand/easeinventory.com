import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const client = new EventBridgeClient({});

export async function publishEvent(
  source: string,
  detailType: string,
  detail: Record<string, unknown>
): Promise<void> {
  const busName = process.env.EVENT_BUS_NAME;
  if (!busName) {
    console.warn("EVENT_BUS_NAME not set, skipping event publish:", detailType);
    return;
  }

  await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: busName,
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify({
            ...detail,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    })
  );
}
