import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // Dieu huong du lieu sang tang service
    const createdBoard = await boardService.createNew(userId, req.body)

    // Co ket qua thi tra ve phia Client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {
    next(error) // goi den middleware xu ly loi tap trung
  }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id // de kiem tra quyen truy cap cua user khi truy cap vao mot board cu the
    const boardId = req.params.id // id nay nhan duoc tu /:id ben boardRoute

    const board = await boardService.getDetails(userId, boardId)

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

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // page & itemsPerPage duoc truyen vao trong query url tu phia FE nen BE se lay thong qua req.query
    const { page, itemsPerPage, q } = req.query
    const queryFilters = q
    const result = await boardService.getBoards(userId, page, itemsPerPage, queryFilters)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}
