import { Transporter, createTransport } from "nodemailer"
const SMTP_HOST = `${process.env.SMTP_HOST}`
const SMTP_PORT = `${process.env.SMTP_PORT}`
const SMTP_USER = `${process.env.SMTP_USER}`
const SMTP_PASSWORD = `${process.env.SMTP_PASSWORD}`

const constants = {
    SMTP_HOST: `${process.env.SMTP_HOST}`,
    SMTP_PORT: `${process.env.SMTP_PORT}`,
    SMTP_USER: `${process.env.SMTP_USER}`,
    SMTP_PASSWORD: `${process.env.SMTP_PASSWORD}`


}


class MailService {
    transporter:Transporter
    constructor() {
        this.transporter = createTransport({
            host: SMTP_HOST,
            tls: {
                rejectUnauthorized: false,
            },
            secure: true,
            auth: {
                user: constants.SMTP_USER,
                pass: constants.SMTP_PASSWORD
            }
        })
    }
    async sendActivationEmail(to:string, url:string,text:string) {
        await this.transporter.sendMail({
            from: constants.SMTP_USER,
            to,
            subject: 'Accaunt activation code',
            html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the DevAT channel.</h2>
              <p>Congratulations! You're almost set to start using BlogDEV.
                  Just click the button below to validate your email address.
              </p>
              
              <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${text}</a>
          
              <p>If the button doesn't work for any reason, you can also click on the link below:</p>
          
              <div>${url}</div>
              </div>
            `
        })
        
    }
}
export default new MailService()