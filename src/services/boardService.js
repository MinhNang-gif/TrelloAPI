/* Tang service: xu ly logic du lieu theo dac thu du an */
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

const createNew = async (userId, reqBody) => {
  try {
    // Xu ly logic du lieu dac thu cua du an
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Goi toi tang Model de xu ly luu ban ghi newBoard vao Database
    const createdBoard = await boardModel.createNew(userId, newBoard)

    // Lay toan bo du lieu tu ban ghi sau khi tao (tuy vao du an ma co thuc hien buoc nay kh)
    const getNewBoard = await boardModel.getOneById(createdBoard.insertedId)

    // Tat ca cac ham tu service ve sau deu can return de ben controller nhan duoc ket qua tra ve
    return getNewBoard
  } catch (error) {
    throw error // chi can throw error vi phan error da duoc xu ly tap trung o tang controller
  }
}

const getDetails = async (userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId)

    if (!board)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')

    /* Xu ly du lieu columns va cards cua BE (columns va cards dang cung cap nhau) sang giong voi FE (cards long trong cap columns) de dong bo du lieu */
    // B1. Dung cloneDeep de tao ra mot cai moi de xu ly, kh lien quan toi cai cu
    const resBoard = cloneDeep(board)

    // B2. Dua card ve dung column cua no
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })

    // B3. Xoa mang cards trong resBoard de du lieu giong voi FE
    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, resBody) => {
  try {
    const updateData = {
      ...resBody,
      createdAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)
    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumn = async (resBody) => {
  try {
    // B1: Cap nhat lai mang cardOrderIds ben column cu (xoa _id cua card ra khoi mang cardOrderIds)
    await columnModel.update(resBody.prevColumnId, {
      cardOrderIds: resBody.prevCardOrderIds,
      createdAt: Date.now()
    })

    // B2: Cap nhat lai mang cardOrderIds ben column moi (them _id cua card vao mang cardOrderIds)
    await columnModel.update(resBody.nextColumnId, {
      cardOrderIds: resBody.nextCardOrderIds,
      createdAt: Date.now()
    })

    // B3: Cap nhat lai truong columnId thanh cua column moi cua card da keo
    await cardModel.update(resBody.currentCardId, {
      columnId: resBody.nextColumnId
    })

    return { updateResult: 'Successfully!' }
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Neu kh ton tai page hoac itemsPerPage tu phia FE day len thi BE se luon gan cho no gia tri mac dinh
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const result = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10)) // page & itemsPerPage nhan duoc tu FE thong qua req.query la dang string, can chuyen ve dang int de xu ly

    return result
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}
