import 'isomorphic-fetch';
import { Client, ResponseType } from '@microsoft/microsoft-graph-client';

export async function getProfilePicture(accessToken) {
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  const profilePhoto = await client
    .api('me/photos/48x48/$value')
    .responseType(ResponseType.ARRAYBUFFER)
    .get();

  return Buffer.from(profilePhoto).toString('base64');
}
