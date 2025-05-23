import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.getOneById(createdCard.insertedId)

    if (getNewCard) {
      // Xu ly khi tao moi 1 card thi se them cardId vao cuoi mang cardOrderIds cua collection column
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updateCard = {}

    // Truong hop upload file len Cloud Storage, cu the la Cloudinary
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')

      // Luu url (secure_url) cua file hinh anh nhan duoc sau khi upload len Cloudinary vao DB
      updateCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else {
      // Cac truong hop update chung nhu title, description
      updateCard = await cardModel.update(cardId, updateData)
    }

    return updateCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
