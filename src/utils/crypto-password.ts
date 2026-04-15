import crypto from "crypto";

const ITERATIONS = 100000; // high enough for brute-force resistance
const KEYLEN = 64;
const DIGEST = "sha512";

export const hashPassword = (password: string, salt?: string) => {
  // generate a random salt if not provided
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .pbkdf2Sync(password, actualSalt, ITERATIONS, KEYLEN, DIGEST)
    .toString("hex");

  // store both salt + hash
  return `${actualSalt}:${hash}`;
};

export const validatePassword = (password: string, storedHash: string) => {
  const [salt, key] = storedHash.split(":");

  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST)
    .toString("hex");


  return key.trim() === hash.trim();
};
