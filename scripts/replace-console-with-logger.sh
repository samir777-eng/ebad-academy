#!/bin/bash

# Script to replace console.* calls with logger.* calls in API routes
# This ensures production-safe logging

echo "🔧 Replacing console statements with logger in API routes..."

# Find all TypeScript files in app/api
find app/api -name "*.ts" -type f | while read -r file; do
  # Check if file contains console statements
  if grep -q "console\." "$file"; then
    echo "Processing: $file"
    
    # Check if logger is already imported
    if ! grep -q "import.*logger.*from.*@/lib/logger" "$file"; then
      # Add logger import after the first import statement
      sed -i '' '1,/^import/s/^\(import.*\)$/\1\nimport { logger } from "@\/lib\/logger";/' "$file"
    fi
    
    # Replace console.log with logger.log
    sed -i '' 's/console\.log/logger.log/g' "$file"
    
    # Replace console.error with logger.error
    sed -i '' 's/console\.error/logger.error/g' "$file"
    
    # Replace console.warn with logger.warn
    sed -i '' 's/console\.warn/logger.warn/g' "$file"
    
    # Replace console.info with logger.info
    sed -i '' 's/console\.info/logger.info/g' "$file"
    
    # Replace console.debug with logger.debug
    sed -i '' 's/console\.debug/logger.debug/g' "$file"
    
    echo "✅ Updated: $file"
  fi
done

echo "🎉 Console replacement complete!"

