import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body) // res.body la du lieu nhan duoc tu FE
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)

    // throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'test api error')

    // Dieu huong du lieu sang tang service
    const createdBoard = await boardService.createNew(req.body)

    // Co ket qua thi tra ve phia Client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {
    next(error) // goi den middleware xu ly loi tap trung
  }
}

export const boardController = {
  createNew
}