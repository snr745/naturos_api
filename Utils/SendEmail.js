const nodemailer=require('nodemailer');


const sendEmail= async options =>{
    //creat a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.Email_Host,
        port: process.env.Email_Port,
        //secure: true,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: process.env.Email_UserName,
          pass: process.env.Email_Password,
        },
      });

    //define the email options
    const mailOptions={
        from:"Nagarajan <snr745@gmail.com>",
        to:options.email,
        subject:options.subject,
        text:options.message
    }

    //actually send the email
    await transporter.sendMail(mailOptions);
}

module.exports=sendEmail;