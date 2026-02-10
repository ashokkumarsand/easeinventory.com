import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { localBus } from "./local-bus";

const isLocal = !process.env.EVENT_BUS_NAME || process.env.NODE_ENV === "development";

let client: EventBridgeClient | null = null;
function getClient() {
  if (!client) {
    const endpoint = process.env.LOCALSTACK_ENDPOINT;
    client = new EventBridgeClient(
      endpoint ? { endpoint, region: "ap-south-1" } : {}
    );
  }
  return client;
}

export async function publishEvent(
  source: string,
  detailType: string,
  detail: Record<string, unknown>
): Promise<void> {
  const enrichedDetail = { ...detail, timestamp: new Date().toISOString() };

  // Local mode: use in-memory bus
  if (isLocal) {
    await localBus.publish(source, detailType, enrichedDetail);
    return;
  }

  // AWS mode: use EventBridge
  const busName = process.env.EVENT_BUS_NAME;
  if (!busName) {
    console.warn("EVENT_BUS_NAME not set, skipping event publish:", detailType);
    return;
  }

  await getClient().send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: busName,
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(enrichedDetail),
        },
      ],
    })
  );
}
