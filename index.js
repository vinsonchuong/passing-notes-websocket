import {createHash} from 'node:crypto'
import WebSocket from 'ws'

const webSocketHashingConstant = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
const keyRegex = /^[+/\dA-Za-z]{22}==$/

export default function (acceptWebSocket) {
  return (next) => (request) => {
    if (
      parseConnectionHeader(request.headers).includes('Upgrade') &&
      request.headers.upgrade === 'websocket'
    ) {
      if (request.method !== 'GET') {
        return {
          status: 405,
          body: 'HTTP method must be GET',
        }
      }

      const version = Number(request.headers['sec-websocket-version'])
      if (version !== 8 && version !== 13) {
        return {
          status: 400,
          body: 'Sec-WebSocket-Version must be 8 or 13',
        }
      }

      const key = request.headers['sec-websocket-key']
      if (!key || !keyRegex.test(key)) {
        return {
          status: 400,
          body: 'Invalid Sec-WebSocket-Key',
        }
      }

      return {
        status: 101,
        headers: {
          Upgrade: 'websocket',
          Connection: 'Upgrade',
          'Sec-WebSocket-Accept': createHash('sha1')
            .update(`${key}${webSocketHashingConstant}`)
            .digest('base64'),
        },
        upgrade(socket, head) {
          const ws = new WebSocket(null)
          ws.setSocket(socket, head, {
            maxPayload: 100 * 1024 * 1024,
            skipUTF8Validation: false,
          })
          acceptWebSocket(ws)
        },
      }
    }

    return next(request)
  }
}

function parseConnectionHeader(headers) {
  const header = headers.connection

  if (!header) {
    return []
  }

  return header.split(',').map((value) => value.trim())
}
