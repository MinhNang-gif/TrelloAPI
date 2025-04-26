import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body) // res.body la du lieu nhan duoc tu FE
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)

    // Dieu huong du lieu sang tang service
    const createdBoard = await boardService.createNew(req.body)

    // Co ket qua thi tra ve phia Client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {
    next(error) // goi den middleware xu ly loi tap trung
  }
}

const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id // id nay nhan duoc tu /:id ben boardRoute
    const board = await boardService.getDetails(boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)
    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetails,
  update
}
