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

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
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
    } else if (updateData.commentToAdd) {
      // Truong hop add comment
      // Tao du lieu comment de them vao DB, bo sung them cac field can thiet de day du du lieu nhu trong schema comments cua cardModel
      const commentData = {
        ...updateData.commentToAdd, // day la 3 fields userAvatar, userDisplayName, content ma ben FE day len
        commentedAt: Date.now(),
        // userId & userEmail se lay tu token
        userId: userInfo._id,
        userEmail: userInfo.email
      }

      updateCard = await cardModel.unshiftNewComment(cardId, commentData)
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
