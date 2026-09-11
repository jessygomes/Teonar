import crypto from "crypto";

const COOKIE_NAME = "teonar_admin";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET est manquant.");
  }

  return secret;
}

export function createAdminToken() {
  return crypto
    .createHmac("sha256", getSecret())
    .update("teonar-admin-authenticated")
    .digest("hex");
}

export function verifyAdminToken(token?: string) {
  if (!token) return false;

  const expected = createAdminToken();

  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);

  if (tokenBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
}

export { COOKIE_NAME };