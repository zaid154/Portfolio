import path from 'node:path'
import dotenv from 'dotenv'

// One shared .env for the whole project, located at the repo root.
// Loaded here as a side effect (import this first) so it runs before any
// other module reads process.env.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
