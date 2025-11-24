import serverless from 'serverless-http'
import app from '../src/index.js'

// Wrap the express app for Vercel serverless functions
const handler = serverless(app)

// Export the handler as the default export for Vercel
export default handler
