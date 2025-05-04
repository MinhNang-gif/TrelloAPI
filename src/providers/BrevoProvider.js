const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY


const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  // Khoi tao mot cac sendSmtpEmail voi nhung thong tin can thiet
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  // Tai khoan gui email
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // Nhung tai khoan nhan email
  sendSmtpEmail.to = [{ email: recipientEmail }]

  // Tieu de cua email
  sendSmtpEmail.subject = customSubject

  // Noi dung email dang HTML
  sendSmtpEmail.htmlContent = htmlContent

  // Goi hanh dong gui email
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}
