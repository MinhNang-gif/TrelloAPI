import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'

const Router = express.Router()

// route Create New Board
Router.route('')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'GET: API get list board' })
  })
  .post(boardValidation.createNew, boardController.createNew) // chi khoi tao chu kh goi ham createNew

// route Get & Put Details Board
Router.route('/:id')
  .get(boardController.getDetails)
  .put(boardValidation.update, boardController.update)

export const boardRoute = Router
