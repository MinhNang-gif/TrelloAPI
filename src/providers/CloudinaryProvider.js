import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'


// Cau hinh cloudinary, su dung v2 - version 2
const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// Func thuc hien upload file len Cloudinary
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    // Tao luong stream upload len cloudinary
    const stream = cloudinaryV2.uploader.upload_stream({ folder: folderName }, (error, result) => { // folder de khi upload file len Cloudinary thi no se upload vao dung folder co ten folderName
      if (result) resolve(result)
      else reject(error)
    })

    // Thuc hien upload luong tren bang thu vien streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const CloudinaryProvider = { streamUpload }
