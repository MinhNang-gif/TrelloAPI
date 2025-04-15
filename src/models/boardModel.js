/* Model layer: define collection (name & schema) */

import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),

  // Cac item trong mang columnOrderIds la ObjectId nen can them pattern
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Validate lai 1 lan nua o tang model truoc khi dua data vao db
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Choc vao database de tao ban ghi sau do gui du lieu ve tang service
const createNew = async (data) => { // data la du lieu nhan duoc phia service
  try {
    const validData = await validateBeforeCreate(data)

    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData) // insertOne dung de chen mot ban ghi vao mot collection trong mongodb
    return createdBoard
  } catch (error) {
    throw new Error(error) // dung new Error thi moi tra ve stack trace, con error thi kh
  }
}

// Choc vao database mot lan nua de lay toan bo du lieu tu db (db compass) ve (postman) de hien thi cho nguoi dung dua vao id
const getOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id) // findOne nhan id duoi dang ObjectId chu kh phai string
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  getOneById
}
