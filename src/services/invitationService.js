import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    /** B1: Query */
    // Nguoi di moi: chinh la nguoi thuc hien req, nen se tim theo id lay tu token
    const inviter = await userModel.getOneById(inviterId)
    // Nguoi duoc moi: lay theo email nhan duoc tu FE
    const invitee = await userModel.getOneByEmail(reqBody.inviteeEmail)
    // Tim board de lay data xu ly
    const board = await boardModel.getOneById(reqBody.boardId)

    /** B2: Check data */
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee, or Board is not found!')
    }

    /** B3: Tao data de luu vao DB */
    // Tao data can thiet (cac du lieu ma ben schema cua invitationModel can) de luu vao DB
    const invitationData = {
      inviterId: inviterId,
      inviteeId: invitee._id.toString(), // chuyen tu ObjectId ve String vi ben Model co check lai data o ham create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    /** B4: Thuc hien luu data vao DB */
    // Goi sang Model de luu vao DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(invitationData)
    const getInvitation = await invitationModel.getOneById(createdInvitation.insertedId)

    // Ngoai du lieu cua board invitation moi tao, chung ta se tra ve ca inviter, invitee, board cho phia FE de thoai mai xu ly
    const resInvitation = {
      ...getInvitation,
      board: board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation
}
