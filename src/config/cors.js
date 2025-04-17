import { StatusCodes } from 'http-status-codes'
import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from './environment'
import ApiError from '~/utils/ApiError'


// Cau hinh CORS options
export const corsOptions = {
  origin: function(origin, callback) {
    // Tren postman thi origin se la undefined -> can cho phep viec goi API bang postman tren moi truong dev
    if (!origin && env.BUILD_MODE === 'dev')
      return callback(null, true)

    // Kiem tra origin co phai domain duoc chap nhan kh
    if (WHITELIST_DOMAINS.includes(origin))
      return callback(null, true) // (kh co loi, cho phep truy cap)
    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} is not allowed by our CORS Policy.`))
  },

  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,

  // CORS sẽ cho phép nhận cookies từ request
  credentials: true
}