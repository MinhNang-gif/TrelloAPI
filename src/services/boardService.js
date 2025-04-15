/* eslint-disable no-useless-catch */
/* Tang service: xu ly logic du lieu theo dac thu du an */

import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'

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

    // Tat ca cac ham trong service deu can return de ben controller nhan duoc ket qua tra ve
    return getNewBoard
  } catch (error) {
    throw error // tu tang service tro di thi chi can throw error vi phan error da duoc xu ly tap trung o tang controller
  }
}

export const boardService = {
  createNew
}
