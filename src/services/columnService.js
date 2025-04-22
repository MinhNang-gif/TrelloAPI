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

// const getDetails = async (columnId) => {
//   try {
//     const column = await columnModel.getDetails(columnId)

//     if (!column)
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')

//     return column
//   } catch (error) {
//     throw error
//   }
// }

export const columnService = {
  createNew
  // getDetails
}
