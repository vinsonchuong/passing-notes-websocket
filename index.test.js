import test from 'ava'
import {startServer, stopServer, compose, sendRequest} from 'passing-notes'
import WebSocket from 'ws'
import serveWebSocket from './index.js'

test('accepting WebSocket requests', async (t) => {
  const server = await startServer(
    {port: 10_000},
    compose(
      serveWebSocket(async (ws) => {
        const message = await new Promise((resolve) => {
          ws.once('message', resolve)
        })
        t.is(message.toString(), 'Ping')

        ws.send('Pong')
      }),
      () => () => ({status: 404}),
    ),
  )
  t.teardown(() => {
    stopServer(server)
  })

  const ws = new WebSocket('ws://localhost:10000')
  await new Promise((resolve) => {
    ws.once('open', resolve)
  })

  ws.send('Ping')

  const message = await new Promise((resolve) => {
    ws.once('message', resolve)
  })
  t.is(message.toString(), 'Pong')
})

test('rejecting invalid WebSocket requests', async (t) => {
  const server = await startServer(
    {port: 10_001},
    compose(
      serveWebSocket(async (ws) => {
        ws.send('Hello World!')
      }),
      () => () => ({status: 404}),
    ),
  )
  t.teardown(() => {
    stopServer(server)
  })

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10001',
    }),
    {
      status: 404,
    },
  )

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10001',
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket',
      },
    }),
    {
      status: 400,
    },
  )

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10001',
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket',
        'Sec-WebSocket-Version': 1,
      },
    }),
    {
      status: 400,
    },
  )

  t.like(
    await sendRequest({
      method: 'GET',
      url: 'http://localhost:10001',
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket',
      },
    }),
    {
      status: 400,
    },
  )
})
