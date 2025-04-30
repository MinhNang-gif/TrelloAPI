/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cors from 'cors'
import { corsOptions } from './config/cors'


const START_SERVER = () => {
  const app = express()

  // Xu ly CORS (ben phia BE)
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs V1
  app.use('/v1', APIs_V1)

  // Middleware xu ly loi tap trung
  app.use(errorHandlingMiddleware)

  // Moi truong production
  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(`3. Production: Hi ${process.env.AUTHOR}, Back-end server is running at Port ${process.env.PORT}`)
    })
  } else {
    // Moi truong local dev
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Local Dev: Hi ${process.env.AUTHOR}, Back-end server is running at http://${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }

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
