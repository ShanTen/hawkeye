import {google} from 'googleapis';
import fs from 'fs';

const read_json = (fileLoc) => JSON.parse(fs.readFileSync(fileLoc));
const google_config = read_json('./runtimeConfig.json');

const {client_id, project_id, auth_uri, token_uri, auth_provider_x509_cert_url, client_secret, redirect_uris, refresh_token} = google_config;

var redirect_uri = redirect_uris[0];

console.log(redirect_uri);

const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
);

oauth2Client.setCredentials({refresh_token} );

const drive = google.drive({
        version: 'v3',
        auth: oauth2Client
});

const filepath = `./testImage.jpg`;

async function upload_file(){
    try{
        const response = await drive.files.create({
            requestBody: {
                name: 'testImage.jpg',
                mimeType: 'image/jpeg'
            },
            media: {
                mimeType: 'image/jpeg',
                body: fs.createReadStream(filepath)
            }
        })

        console.log(response.data);
    }

    catch(err){
        console.log(err);
    }
}


upload_file();