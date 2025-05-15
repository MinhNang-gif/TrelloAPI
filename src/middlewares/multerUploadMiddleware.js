import multer from 'multer'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators'

// Func kiem tra loai file nao duoc chap nhan
const customFileFilter = (req, file, callback) => {
  // Doi voi multer, kiem tra kieu file thi dung mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage), null)
  }
  // Neu kieu file hop le
  return callback(null, true) // tham so thu 1 la errorMessage, tham so thu 2 la boolean xac nhan chap nhan hay kh
}

// Khoi tao function upload duoc boc boi multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = {
  upload
}
