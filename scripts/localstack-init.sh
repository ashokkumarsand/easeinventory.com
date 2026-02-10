#!/bin/bash
set -e
echo "Initializing LocalStack resources..."

# Wait for LocalStack to be ready
sleep 2

# S3 bucket
awslocal s3 mb s3://easeinventory-storage 2>/dev/null || true

# SQS queues
awslocal sqs create-queue --queue-name webhook-queue --region ap-south-1
awslocal sqs create-queue --queue-name report-queue --region ap-south-1
awslocal sqs create-queue --queue-name bulk-queue --region ap-south-1
awslocal sqs create-queue --queue-name events-dlq --region ap-south-1

# EventBridge bus
awslocal events create-event-bus --name easeinventory-events --region ap-south-1

echo "LocalStack initialization complete!"
echo "  S3: easeinventory-storage"
echo "  SQS: webhook-queue, report-queue, bulk-queue, events-dlq"
echo "  EventBridge: easeinventory-events"
