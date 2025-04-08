import { StatusCodes } from 'http-status-codes'

const createNew = (req, res, next) => {
  try {
    console.log('req.body: ', req.body) // res.body la du lieu nhan duoc tu FE
    console.log('req.query: ', req.query)
    console.log('req.params: ', req.params)

    res.status(StatusCodes.CREATED).json({
      message: 'POST From Controller: API Create New Board'
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: error.message
    })
  }
}

export const boardController = {
  createNew
}