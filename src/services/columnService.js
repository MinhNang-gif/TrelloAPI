import { columnModel } from '~/models/columnModel'
// import ApiError from '~/utils/ApiError'
// import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'

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

export const columnService = {
  createNew,
  update
}
