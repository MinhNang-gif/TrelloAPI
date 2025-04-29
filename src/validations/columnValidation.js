import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).trim().strict(),
    title: Joi.string().required().min(3).max(50).trim().strict()
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const messageError = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, messageError)
    next(customError)
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).trim().strict(),
    title: Joi.string().min(3).max(50).trim().strict()
  })
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    const messageError = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, messageError)
    next(customError)
  }
}

const deleteColumnDetails = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).trim().strict()
  })
  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const messageError = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, messageError)
    next(customError)
  }
}

export const columnValidation = {
  createNew,
  update,
  deleteColumnDetails
}
