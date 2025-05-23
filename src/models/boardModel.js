/* Model layer: define collection (name & schema) */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { userModel } from './userModel'
import { pagingSkipValue } from '~/utils/algorithms'


const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  // Cac item trong mang columnOrderIds la ObjectId nen can them pattern
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chi dinh cac fields kh cho nguoi dung update trong ham update()
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

// Validate lai 1 lan nua o tang model truoc khi dua data vao db
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Choc vao database de tao ban ghi sau do gui du lieu ve tang service
const createNew = async (userId, data) => { // data la du lieu nhan duoc phia service
  try {
    const validData = await validateBeforeCreate(data)

    const boardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)] // Khi tao 1 board moi thi gan userId cua user thuc hien req tao moi board lam chu cua board do
    }

    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(boardToAdd) // insertOne dung de chen mot ban ghi vao mot collection trong mongodb
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

// Query tong hop (aggregate) de lay toan bo columns & cards thuoc ve board
const getDetails = async (userId, boardId) => {
  try {
    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
    //   _id: new ObjectId(boardId)
    // })

    const queryConditions = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'ownerIds',
          foreignField: '_id', // userId cua ben userModel
          as: 'owners',
          // pipeline trong lookup de xu ly mot hay nhieu luong can thiet
          // $project de chi dinh vai field kh muon lay ve bang cac gan cho no gia tri bang 0
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'memberIds',
          foreignField: '_id',
          as: 'members',
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      }
    ]).toArray()

    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// Func xu ly them columnId vao cuoi mang columnOrderIds trong collection board
// Dong $push trong mongodb de push mot columnId vao cuoi mang columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) }, // dieu kien de tim kiem collection board chua column nay
      { $push: { columnOrderIds: new ObjectId(column._id) } }, // push vao cai gi
      { returnDocument: 'after' } // tra ve collection sau khi update
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Xoa columnId cua mang columnOrderIds khi xoa column
// Dung $pull trong mongodb
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Cac du lieu lien quan toi ObjectId thi bien doi o day
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(_id)))
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      // Dieu kien 1: Board chua bi xoa
      { _destroy: false },
      // Dieu kien 2: userId dang thuc hien request nay no phai thuoc 1 trong 2 cai mang ownerIds hoac memberIds, su dung toan tu $all cua mongodb
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        // Dieu kien
        { $match: { $and: queryConditions } },
        // sort title cua board theo thu tu A-Z (mac dinh gap van de la chu B hoa dung truoc chu a thuong (theo bang ASCII))
        { $sort: { title: 1 } },
        // $facet de xu ly nhieu luong trong mot query
        { $facet: {
          // Luong 1: Query boards
          'queryBoards': [
            { $skip: pagingSkipValue(page, itemsPerPage) }, // Bo qua so luong ban ghi cua nhung page truoc do
            { $limit: itemsPerPage } // Gioi han toi da so luong ban ghi tra ve tren 1 page
          ],

          // Luong 2: Query dem tong tat ca so luong ban ghi boards trong DB va tra ve vao bien countedAllBoards
          'queryTotalBoards': [
            { $count: 'countedAllBoards' }
          ]
        } }
      ],
      // Fix van de cua $sort
      { collation: { locale: 'en' } }
    ).toArray()

    // console.log('query: ', query)
    const res = query[0]
    // console.log('res: ', res)

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  getOneById,
  getDetails,
  pushColumnOrderIds,
  pullColumnOrderIds,
  update,
  getBoards
}

