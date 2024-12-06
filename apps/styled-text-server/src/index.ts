import { app } from './app'

const port = process.env.PORT

app.listen(port, () => {
  console.log(`styled-text-server listening on port ${port}`)
})
