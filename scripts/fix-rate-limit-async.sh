#!/bin/bash

# Script to add await to checkRateLimit calls
# This is needed because checkRateLimit is now async

echo "🔧 Adding await to checkRateLimit calls..."

# Find all files that use checkRateLimit
find app/api -name "*.ts" -type f -exec grep -l "checkRateLimit" {} \; | while read -r file; do
  # Skip the auth route as we already fixed it
  if [[ "$file" == *"auth/[...nextauth]/route.ts"* ]]; then
    echo "⏭️  Skipping (already fixed): $file"
    continue
  fi
  
  # Check if file contains checkRateLimit without await
  if grep -q "= checkRateLimit" "$file" && ! grep -q "= await checkRateLimit" "$file"; then
    echo "Processing: $file"

    # Add await before checkRateLimit (handles both rateLimitResult and rateLimit variable names)
    sed -i '' 's/const rateLimitResult = checkRateLimit/const rateLimitResult = await checkRateLimit/g' "$file"
    sed -i '' 's/const rateLimit = checkRateLimit/const rateLimit = await checkRateLimit/g' "$file"

    echo "✅ Updated: $file"
  fi
done

echo "🎉 Rate limit async fix complete!"

