/* eslint-disable no-useless-catch */
/* Tang service: xu ly logic du lieu theo dac thu du an */

import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    // Xu ly logic du lieu dac thu cua du an
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Goi toi tang Model de xu ly luu ban ghi newBoard vao Database
    const createdBoard = await boardModel.createNew(newBoard)

    // Lay ban ghi board sau khi tao (tuy vao du an ma co thuc hien buoc nay kh)
    const getNewBoard = await boardModel.getOneById(createdBoard.insertedId)

    // Tat ca cac ham tu service ve sau deu can return de ben controller nhan duoc ket qua tra ve
    return getNewBoard
  } catch (error) {
    throw error // chi can throw error vi phan error da duoc xu ly tap trung o tang controller
  }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)

    if (!board)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')

    return board
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails
}
