# passing-notes-websocket
[![npm](https://img.shields.io/npm/v/passing-notes-websocket.svg)](https://www.npmjs.com/package/passing-notes-websocket)
[![CI Status](https://github.com/vinsonchuong/passing-notes-websocket/workflows/CI/badge.svg)](https://github.com/vinsonchuong/passing-notes-websocket/actions?query=workflow%3ACI)

A middleware for accepting WebSocket connections

## Usage
Install [passing-notes-websocket](https://www.npmjs.com/package/passing-notes-websocket)
by running:

```sh
yarn add passing-notes-websocket
```

Then, compose it with other middleware, or at least a default handler:

```javascript
import {compose} from 'passing-notes'
import serveWebSocket from 'passing-notes-websocket'

export default compose(
  serveWebSocket((ws) => {
    ws.on('message', (message) => {
      console.log(message)
    })

    ws.send('Hello World!')
  }),
  () => () => ({status: 404})
)
```

`serveWebSocket` will look for HTTP/1.1 Upgrade requests that ask for
`Upgrade: websocket`. It will then negotiate the upgrade and provide a
[`WebSocket`](https://github.com/websockets/ws) object. Otherwise, it delegates
to the next middleware.
