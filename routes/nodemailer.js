const nodemailer = require('nodemailer');
const {google} = require('googleapis');


const Redirect_Uri = 'https://developers.google.com/oauthplayground';
const Client_Id = `688948569567-86avvagtrsb5rpu3qh0js4vdojgvm7r0.apps.googleusercontent.com`;
const Client_Secret = "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";
const Refresh_Token = `1//045JfXQNelpSoCgYIARAAGAQSNwF-L9Ir48hgQXd5nlb1_wTonqtMZ3RTAZdvXw4EmWAP2CO3TeP1sdqlg0gd6JIMXMFB6wc9IaQ`;

const oAuth2Client= new google.auth.OAuth2(Client_Id,Client_Secret,Redirect_Uri)


oAuth2Client.setCredentials({refresh_token:Refresh_Token})

async function sendMail(z,email){
  try{
    const at = await  oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service:'gmail',
      auth:{
        type:'OAuth2',
        user:'np375431@gmail.com',
        clientId: Client_Id,
        clientSecret: Client_Secret,
        refreshToken: Refresh_Token,
        accessToken : at

      }
    })
    const mailOpts = {
      from :'np375431@gmail.com',
      to:email,
      subject:"jai ho",
      text:'agya na mc',
      html: z
    };

  
  const result = await transport.sendMail(mailOpts);
  return result;
}
catch (error){
return error;
}
}

module.exports = sendMail;