import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { userModel } from './userModel'
import { boardModel } from './boardModel'

// Define Collection (name & schema)
const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // nguoi di moi
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // nguoi duoc moi

  // Kieu cua cai loi moi
  type: Joi.string().valid(...Object.values(INVITATION_TYPES)),

  // Loi moi la board thi se luu them du lieu boardInvitation - optional
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chi dinh cac fields kh cho nguoi dung update trong ham update()
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt']

// Validate lai 1 lan nua o tang model truoc khi dua data vao db
const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    // Bien doi mot so du lieu lien quan den ObjectId o day
    let invitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }

    // Neu ton tai du lieu boardInvitation thi update cho cai boardId ve lai thanh ObjectId
    if (validData.boardInvitation) {
      invitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(invitationToAdd.boardInvitation.boardId)
      }
    }

    // Insert ban ghi vao DB
    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(invitationToAdd)
    return createdInvitation
  } catch (error) {
    throw new Error(error)
  }
}

const getOneById = async (invitationId) => {
  try {
    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({
      _id: new ObjectId(invitationId) // findOne nhan id duoi dang ObjectId chu kh phai string
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (invitationId, updateData) => {
  try {
    // Loc cac fields ma kh cho phep cap nhat linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Cac du lieu lien quan toi ObjectId thi bien doi o day
    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(updateData.boardInvitation.boardId)
      }
    }

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(invitationId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Query tong hop aggregate de lay nhung ban ghi invitation thuoc ve mot user cu the
const getByUser = async (userId) => {
  try {
    const queryConditions = [
      { inviteeId: new ObjectId(userId) }, // tim kiem theo nguoi duoc moi, chinh la nguoi thuc hien req nay
      { _destroy: false }
    ]

    const results = await GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'inviterId', // lay theo nguoi di moi
          foreignField: '_id', // userId cua ben userModel
          as: 'inviter',
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'inviteeId', // lay theo nguoi duoc moi
          foreignField: '_id',
          as: 'invitee',
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: boardModel.BOARD_COLLECTION_NAME,
          localField: 'boardInvitation.boardId', // lay thong tin board
          foreignField: '_id', // boardId lay ben boardModel
          as: 'board'
        }
      }
    ]).toArray()

    return results
  } catch (error) {
    throw new Error(error)
  }
}


export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  getOneById,
  update,
  getByUser
}
