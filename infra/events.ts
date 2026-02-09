export const bus = new sst.aws.Bus("Events");

// Dead letter queue for failed event processing
export const dlq = new sst.aws.Queue("EventsDLQ", {});
