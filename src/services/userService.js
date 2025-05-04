import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'

const createNew = async (reqBody) => {
  try {
    // B1. Kiem tra email da ton tai trong he thong cua chung ta chua
    const isUserExist = await userModel.getOneByEmail(reqBody.email)
    if (isUserExist) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exist!')
    }

    // B2. Tao data de luu vao database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcrypt.hashSync(reqBody.password, 8), // tham so thu 2 la do phuc tap cua viec bam, gia tri cang lon thi bam cang lau
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // B3. Luu thong tin user vao database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.getOneById(createdUser.insertedId)

    // B4. Gui email cho nguoi dung xac thuc tai khoan
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello: Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,<br /> - MinhNang - </h3>
    `
    // Goi toi cai Provider gui mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // B5. return tra ve du lieu cho phia Controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew
}
