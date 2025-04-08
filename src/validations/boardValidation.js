import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

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
    console.log('req.body: ', req.body) // res.body la du lieu nhan duoc tu FE
    await correctCondition.validateAsync(req.body, { abortEarly: false }) // kiem tra du lieu nhan duoc tu FE co thoa voi correctCondition kh, abortEarly: false de no console.log ra het loi
    // next() // chuyen tiep req den noi khac
    res.status(StatusCodes.CREATED).json({ message: 'POST From Validation: API create new board' })
  } catch (error) {
    console.log(error)
    // Du lieu nay de tra ve postman
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message
    })
  }
}

export const boardValidation = {
  createNew
}
