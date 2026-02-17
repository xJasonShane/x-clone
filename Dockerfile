# Cloudflare Pages deployment configuration
$schema: https://developers.cloudflare.com/pages/platform/build-configuration

# Build settings for Next.js
build:
  command: pnpm run build
  output_directory: .next

# Environment variables (configure in Cloudflare dashboard)
# - COZE_BUCKET_ENDPOINT_URL
# - COZE_BUCKET_NAME
# - DATABASE_URL (Supabase connection string)

# Node.js version
node_version: "20"
