import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function signAuthToken(payload) {
    const options = {
        expiresIn: env.JWT_EXPIRES_IN,
    };
    return jwt.sign(payload, env.JWT_SECRET, {
        ...options,
    });
}
export function verifyAuthToken(token) {
    return jwt.verify(token, env.JWT_SECRET);
}
