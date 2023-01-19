import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const emailTemplate = (title: string, message: string) => `
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">${title}</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            ${message}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>sticalms.com</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>`;

interface MainInput {
  receiver: string;
  subjectPurpose: string;
  message: string;
  messageTitle: string;
}

async function sendEmail({
  receiver,
  subjectPurpose,
  message,
  messageTitle,
}: MainInput) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'sendinblue',
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_KEY,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: receiver,
      subject: `${subjectPurpose} - STICA Library Management System`,
      // text: message,
      html: emailTemplate(messageTitle, message),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return reject({ message: error.message });
      }

      return resolve({ message: `Email sent: ${  info.response}` });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Request method not allowed' });
  }

  const { receiver, subjectPurpose, message, messageTitle } = req.body;

  if (!receiver || !subjectPurpose || !message || !messageTitle) {
    return res.status(400).json({
      fields: ['receiver', 'subjectPurpose', 'message'],
      error: 'All fields are required',
    });
  }

  try {
    const result = await sendEmail({
      receiver,
      subjectPurpose,
      message,
      messageTitle,
    });
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error });
  }
}
