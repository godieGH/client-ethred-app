// ─── src/boot/socket.js ───────────────────────────────────────────────────────
import { boot } from 'quasar/wrappers'
import { io as createSocket } from 'socket.io-client'

// Point this to your backend’s Socket.IO URL (fallback to http://localhost:3000)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

// We declare socket here so we can export it later
let socket

export default boot(({ app }) => {
  // 1) Create the shared Socket.IO client instance:
  socket = createSocket(SOCKET_URL, {
    // (optional) you can customize transports, auth payload, etc.
    // transports: ['websocket'],
    // autoConnect: false,
  })

  // 2) Make it available as this.$socket in Options API components:
  app.config.globalProperties.$socket = socket

  // 3) Also "provide" it so you can inject('socket') in Composition API:
  app.provide('socket', socket)

  // (Optional) Any global listeners can go here, e.g.:
  // socket.on('connect', () => {
  //   console.log('Socket connected as:', socket.id);
  // });
})

// 4) Export the same socket instance so you can do:
//    import { socket } from 'boot/socket'
export { socket }
