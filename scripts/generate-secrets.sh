#!/bin/bash

# Ebad Academy - Secret Generator Script
# Generates secure random secrets for production deployment

echo "🔐 Ebad Academy - Secret Generator"
echo "===================================="
echo ""
echo "This script generates secure random secrets for your production deployment."
echo ""

# Generate NEXTAUTH_SECRET
echo "NEXTAUTH_SECRET (for NextAuth.js authentication):"
echo "---------------------------------------------------"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "$NEXTAUTH_SECRET"
echo ""

# Generate CRON_SECRET
echo "CRON_SECRET (for cron job security):"
echo "--------------------------------------"
CRON_SECRET=$(openssl rand -base64 32)
echo "$CRON_SECRET"
echo ""

# Generate additional secrets if needed
echo "Additional secrets (if needed):"
echo "--------------------------------"
echo "Random Secret 1: $(openssl rand -base64 32)"
echo "Random Secret 2: $(openssl rand -base64 32)"
echo ""

echo "===================================="
echo "✓ Secrets generated successfully!"
echo "===================================="
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo ""
echo "1. Copy these secrets to your Vercel environment variables"
echo "2. NEVER commit these secrets to Git"
echo "3. Store them securely (e.g., password manager)"
echo "4. Generate new secrets if they are ever exposed"
echo "5. Use different secrets for production and staging"
echo ""
echo "To add to Vercel:"
echo "1. Go to your project → Settings → Environment Variables"
echo "2. Add NEXTAUTH_SECRET with the value above"
echo "3. Add CRON_SECRET with the value above"
echo "4. Select 'Production' environment"
echo "5. Click 'Save'"
echo ""

