import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { env } from '~/config/environment'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'

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

const verifyAccount = async (reqBody) => {
  try {
    // B1. Query user trong DB
    const user = await userModel.getOneByEmail(reqBody.email)

    // B2. Cac buoc kiem tra
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User is not found!')
    }
    if (user.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'User is already actived!')
    }
    if (reqBody.token !== user.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')
    }

    // B3. Neu kh co van de gi thi cap nhat lai data cho user de verify token
    const udpateData = {
      isActive: true,
      verifyToken: null
    }
    const updatedUser = await userModel.update(user._id, udpateData)
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    // B1. Query user trong DB
    const user = await userModel.getOneByEmail(reqBody.email)

    // B2. Cac buoc kiem tra
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account is not found!')
    }
    if (!user.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'User is not actived!')
    }
    if (!bcrypt.compareSync(reqBody.password, user.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!')
    }

    /* B3. Neu moi thu deu ok thi tao tokens dang nhap de tra ve cho phia FE */
    // Tao thong tin de dinh kem trong JWT token, bao gom _id va email cua user
    const userInfo = {
      _id: user._id,
      email: user.email
    }

    // Tao ra 2 loai token, accessToken va refreshToken de tra ve cho phia FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5, // 5s
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    // Tra ve thong tin user kem theo 2 cai token vua tao
    return {
      accessToken,
      refreshToken,
      ...pickUser(user)
    }
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login
}
