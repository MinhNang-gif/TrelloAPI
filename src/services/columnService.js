import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.getOneById(createdColumn.insertedId)

    if (getNewColumn) {
      // Xu ly cau truc data truoc khi tra data ve
      getNewColumn.cards = []

      // Xu ly khi tao moi mot column thi se them columnId vao cuoi mang columnOrderIds trong collection board
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)
    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteColumnDetails = async (columnId) => {
  try {
    // Tim kiem column dua vao columnId
    const targetColumn = await columnModel.getOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }

    // B1. Xoa column
    await columnModel.deleteOneById(columnId)

    // B2. Xoa cards thuoc column do
    await cardModel.deleteManyCardsById(columnId)

    // B3. Xoa columnId trong columnOrderIds cua collection board
    await boardModel.pullColumnOrderIds(targetColumn)

    return { deleteResult: 'Column and its Cards are deleted successfully!' }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  update,
  deleteColumnDetails
}
