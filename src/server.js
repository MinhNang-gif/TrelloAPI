/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'


const START_SERVER = () => {
  const app = express()

  app.get('/', (req, res) => {
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`3. Hi ${process.env.AUTHOR}, Back-end server is running at http://${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

  // Thuc hien cac tac vu cleanup truoc khi dung server
  exitHook(() => {
    console.log('4. Disconnecting from MongoDB Cloud Atlas')
    CLOSE_DB()
    console.log('5. Disconnected from MongoDB Cloud Atlas')
  })
}

// IIFE
(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas')
    await CONNECT_DB() // can dung await de CONNECT_DB chay xong thi code ben duoi moi chay
    console.log('2. Connected to MongoDB Cloud Atlas')
    START_SERVER() // Chi khi ket noi toi Database thanh cong thi moi Start Server BE len
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

// Function CONNECT_DB la mot function async -> tra ve mot promise -> co the dung .then, .catch
// Chi khi ket noi toi Database thanh cong thi moi Start Server Back-end len
// console.log('1. Connecting to MongoDB Cloud Atlas')
// CONNECT_DB()
//   .then(() => console.log('2. Connected to MongoDB Cloud Atlas'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })
