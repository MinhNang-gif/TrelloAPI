// Dung joi de validate du lieu
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'


const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'stringl.empty': 'Title is not allowed to be empty',
      'string.min': 'Title length must be at least 3 characters long',
      'string.max': 'Title length must be less than or equal to 5 characters long',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict().messages({
      'any.required': 'Description is required',
      'stringl.empty': 'Description is not allowed to be empty',
      'string.min': 'Description length must be at least 3 characters long',
      'string.max': 'Description length must be less than or equal to 5 characters long',
      'string.trim': 'Description must not have leading or trailing whitespace'
    })
  })

  try {
    // kiem tra du lieu nhan duoc tu FE co thoa voi correctCondition kh, abortEarly: false de no console.log ra het loi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validate du lieu hop le thi cho request di tiep den tang Controller
    next()
  } catch (error) {
    const messageError = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, messageError)
    next(customError)
  }
}

export const boardValidation = {
  createNew
}
