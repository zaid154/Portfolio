import './config/env'
import app from './app'

const PORT = Number(process.env.PORT) || 5000

app.listen(PORT, () => {
  console.log(`MockMate AI server running on http://localhost:${PORT}`)
})
