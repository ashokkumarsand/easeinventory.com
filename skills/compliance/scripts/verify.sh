#!/bin/bash

# Ease Inventory: Skill Verification Script
# This script runs basic checks for quality, security, and compliance.

echo "🔍 Starting Ease Inventory Quality Scan..."

# 🛡️ 1. Security Check: Search for PII fields that might not be encrypted
echo "--- Checking Encryption Coverage (ISO 27001) ---"
# Check if GST numbers are used in API routes without a corresponding decrypt call nearby
grep -r "gstNumber" src/app/api | grep -vE "decrypt|includes|substring" && echo "⚠️ Potential unencrypted GST Number usage found!" || echo "✅ GST Number usage seems handled."

# 🏆 2. Quality Check: Search for TODOs and Broken Pieces
echo "--- Scanning for TODOs and Broken Pieces (ISO 9001) ---"
grep -rnEi "TODO|FIXME|BROKEN|IMPLEMENT ME" src | grep -v "node_modules"

# ⚖️ 3. Localization Check: Search for Hardcoded strings in common tags
echo "--- Checking Internationalization ---"
# Simple check for hardcoded text inside spans/divs that doesn't look like code or translation keys
grep -r "<span>" src/app | grep -v "t(" && echo "⚠️ Potential hardcoded strings found in spans!" || echo "✅ UI spans seem to use translations."

# 🛠️ 4. Financial Precision Check
echo "--- Checking Financial Precision ---"
grep -r "Decimal" prisma/schema.prisma || echo "ℹ️ Note: Verify if price fields are using correct precision types."

echo "🚀 Scan complete."
