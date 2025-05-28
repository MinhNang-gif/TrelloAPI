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

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.getByUser(userId)

    // Vi inviter, invitee, board luon tra ve mang co 1 ptu neu lay ve duoc nen chuyen luon ve dang Json Object truoc khi tra ve FE
    const resInvitations = getInvitations.map(i => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {}
      }
    })

    return resInvitations
  } catch (error) {
    throw error
  }
}

const updateStatusInvitation = async (userId, invitationId, status) => {
  try {
    // Lay ban ghi invitation ben modal ma user thuc hien update status
    const getInvitation = await invitationModel.getOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation is not found!')

    // Lay full thong tin board dua vao getInvitation
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.getOneById(boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board is not found!')

    // Neu user thuc hien ACCEPTED ma da thuoc ownerIds hoac memberIds thi thong bao loi
    // Note: 2 mang ownerIds & memberIds luu trong DB cua collection board dang o dang ObjectId, can chuyen ve string de so sanh voi userId (string)
    const boardOwnerIdsAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerIdsAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board!')
    }

    // Tao du lieu de update
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status
      },
      updatedAt: Date.now()
    }

    // Thuc hien update
    const updatedInvitation = await invitationModel.update(invitationId, updateData)

    // Truong hop cap nhat status thanh ACCEPTED thi can them thong tin user (userId) vao mang memberIds cua collection board
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }

    return updatedInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateStatusInvitation
}
