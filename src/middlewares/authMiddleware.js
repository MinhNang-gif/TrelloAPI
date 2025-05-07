import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'


// Middleware nay co nhiem vu quan trong: xac thuc cai JWT accessToken nhan duoc tu phia FE co hop le kh
const isAuthorized = async (req, res, next) => {
  // Lay accessToken nam trong request cookies cua phia FE day len (req cookies nay day len duoc la nho withCredentials ben file authorizeAxios)
  const clientAccessToken = req.cookies.accessToken

  // Neu clientAccessToken kh ton tai thi tra ve loi luon
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token is not found)')) // next(...) de chuyen den phan xu ly loi tap trung
  }

  try {
    // B1. Thuc hien giai ma (xac thuc) token xem no co hop le kh
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    // console.log('accessTokenDecoded: ', accessTokenDecoded)

    // B2. Neu token hop le, can luu thong tin giai ma duoc vao req.jwtDecoded de su dung cho cac tang xu ly phia sau
    req.jwtDecoded = accessTokenDecoded

    // B3. Cho request di tiep den tang tiep theo
    next()
  } catch (error) {
    // console.log('error authMiddleware: ', error)

    // Neu accessToken bi het han thi can tra ve ma loi GONE (410) cho phia FE biet de goi API refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
      return
    }

    // Neu accessToken kh hop le do bat ky dieu gi khac vu het han thi cu tra ve ma 401 cho phia FE goi API sign_out luon
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}
