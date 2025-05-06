import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'

const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client'
}

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  // _id: mongodb se tu sinh
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE), // unique
  password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
  username: Joi.string().required().trim().strict(), // username cat ra tu email se co the kh unique vi co nhung ten email trung nhau nhung tu cac nha cung cap khac nhau
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLES.ADMIN, USER_ROLES.CLIENT).default(USER_ROLES.CLIENT),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

// Chi dinh cac fields kh cho nguoi dung update trong ham update()
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']

// Validate lai 1 lan nua o tang model truoc khi dua data vao db
const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Choc vao database de tao ban ghi sau do gui du lieu ve tang service
const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newUser = {
      ...validData,
      _id: new ObjectId(validData._id)
    }
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(newUser)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

// Choc vao database mot lan nua de lay toan bo du lieu tu db (db compass) ve (postman) de hien thi cho nguoi dung dua vao id
const getOneById = async (userId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: emailValue })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (userId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  USER_ROLES,
  createNew,
  getOneById,
  getOneByEmail,
  update
}
