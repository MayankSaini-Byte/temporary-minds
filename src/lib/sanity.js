import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

/**
 * Sanity Client Configuration
 * 
 * SECURITY BEST PRACTICES:
 * 1. Read-Only Access: Client-side applications must ONLY perform read operations
 *    on public datasets. NEVER include a Sanity write token (`token: ...`) here,
 *    as all Vite client-side code is bundled and visible in the browser.
 * 2. Dataset Permissions: Ensure your Sanity dataset is public for reads, and
 *    write permissions are locked to authenticated studio users or serverless functions.
 * 3. CDN Caching: In production, `useCdn: true` enables edge caching, speeds up responses,
 *    and prevents API rate limit exhaustion and DDoS attacks.
 */

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || '94wv2qdl'
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03'

// Defensive validation: Project ID must be a standard alphanumeric string
if (!/^[a-z0-9]+$/i.test(projectId)) {
  console.error('[Security] Invalid Sanity Project ID configuration.')
}

export const client = createClient({
  projectId,
  dataset,
  // Use edge CDN in production for maximum performance and DDoS protection; bypass in dev for live previews
  useCdn: import.meta.env.PROD,
  apiVersion,
})

// Setup image builder for portable text and asset images
const builder = imageUrlBuilder(client)

export function urlFor(source) {
  if (!source) return { url: () => '' }
  return builder.image(source)
}

