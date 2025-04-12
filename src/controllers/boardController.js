import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'

const createNew = (req, res, next) => {
  try {
    // console.log('req.body: ', req.body) // res.body la du lieu nhan duoc tu FE
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)

    // throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'test api error')

    res.status(StatusCodes.CREATED).json({
      message: 'POST From Controller: API Create New Board'
    })
  } catch (error) {
    next(error) // goi den middleware xu ly loi tap trung
  }
}

export const boardController = {
  createNew
}