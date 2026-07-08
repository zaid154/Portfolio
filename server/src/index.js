import app from './app.js'
import { assertEnv, env } from './config/env.js'
import { connectDb } from './config/db.js'

async function bootstrap() {
  assertEnv()
  await connectDb()

  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`)
  })
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
