import JWT from 'jsonwebtoken'

/** Func tao moi mot token voi 3 tham so
 * userInfo: thong tin muon dinh kem vao token
 * secretSignature: chu ky bi mat (dang mot chuoi string ngau nhien)
 * tokenLife: thoi gian song cua token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

/** Func kiem tra mot token co hop le kh
 * Hop le khi token duoc tao ra dung voi secretSignature trong du an
*/
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
