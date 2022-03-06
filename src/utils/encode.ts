const { createHash } = require('crypto');

export default function encode(body: string) {
  return createHash('sha256').update(body).digest('hex');
}
