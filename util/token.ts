import jwt from "jsonwebtoken";
import { type Request } from "express";

// Define a secret key for JWT. Make sure this is stored securely and not hardcoded in production.
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Define an interface for the user payload
interface UserPayload {
    user_id: string;
    user_name: string;
    club_or_association: string;
}

// Function to generate a token
export function generateToken(user: UserPayload): string {
    const payload = {
        user_id: user.user_id,
        username: user.user_name,
        club_or_association: user.club_or_association,
    };

    // Generate a JWT token with an expiration time of 1 hour
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
}

// Function to validate a token
export function validateToken(req: Request): {
    valid: boolean;
    error?: string;
    decoded?: UserPayload;
} {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { valid: false, error: "No token provided or invalid format" };
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as UserPayload;
        return { valid: true, decoded };
    } catch (err: any) {
        return { valid: false, error: err.message };
    }
}
