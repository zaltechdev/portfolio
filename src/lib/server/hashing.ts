import { env } from '$env/dynamic/private';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = Number(env.HASHING_SALT_ROUNDS) || 10;

/**
 * Hashes a raw password.
 * @param password - The raw password string.
 * @returns The hashed password string.
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
}

/**
 * Verifies a raw password against a hash.
 * @param password - The raw password string.
 * @param hash - The hashed password string to compare against.
 * @returns True if the password matches the hash, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}
