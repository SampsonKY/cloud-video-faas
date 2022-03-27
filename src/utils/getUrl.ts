const md5 = require('md5');

export function getLiveUrl(liveId, pull) {
  const timestamp: number = Math.floor(
    +new Date(Date.now() + 1000 * 60 * 30) / 1000
  );
  const appName = 'cloud-live';
  const streamName = pull ? liveId + '.flv' : liveId;
  const ticket = 'hG6Uto0f8i51lVjl';
  const authKey = md5(`/${appName}/${streamName}-${timestamp}-0-0-${ticket}`);

  return pull
    ? `http://pull.martinyu.xyz/${appName}/${streamName}?auth_key=${timestamp}-0-0-${authKey}`
    : `rtmp://push.martinyu.xyz/${appName}/${streamName}?auth_key=${timestamp}-0-0-${authKey}`;
}
