import express, { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import query from "../util/db"; // Adjust the path to your db utility file
import { generateToken, validateToken } from "../util/token"; // Adjust the path to your token utility file

const router = express.Router();

// Define an interface for user data
interface User {
    user_id: string;
    username: string;
    club_or_association: string;
    password?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - user_id
 *         - username
 *         - club_or_association
 *       properties:
 *         user_id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The name of the user
 *         club_or_association:
 *           type: string
 *           description: The club or association of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         user_id: "1"
 *         username: "JohnDoe"
 *         club_or_association: "Chess Club"
 *         password: "hashed_password"
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API to manage users
 */

/**
 * @swagger
 * /api/u/user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               username:
 *                 type: string
 *               club_or_association:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               user_id: "1"
 *               username: "JohnDoe"
 *               club_or_association: "Chess Club"
 *               password: "password123"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.post("/user", async (req: Request, res: Response) => {
    const { user_id, username, club_or_association, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await query(
            "INSERT INTO user_account (user_id, user_name, club_or_association, password) VALUES ($1, $2, $3, $4) RETURNING user_id, user_name, club_or_association",
            [user_id, username, club_or_association, hashedPassword]
        );
        const user = result.rows[0] as unknown as User;
        res.status(201).json({ user });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/u/user:
 *   get:
 *     summary: Retrieve user data
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: The user password
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: Authentication token
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/user", async (req: Request, res: Response) => {
    const { valid, error, decoded } = validateToken(req);
    if (!valid) {
        return res.status(401).json({ error });
    }

    const { user_id, password } = req.query;
    try {
        const result = await query(
            "SELECT * FROM user_account WHERE user_id = $1",
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = result.rows[0] as unknown as User;

        const isMatch = await bcrypt.compare(password as string, user.password!);

        if (isMatch) {
            const token = generateToken(user);
            res.status(200).json({
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    club_or_association: user.club_or_association,
                },
                token,
            });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/u/user/all:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.get("/user/all", async (req: Request, res: Response) => {
    try {
        const result = await query("SELECT * FROM user_account", []);
        const users = result.rows as unknown as User[];
        res.status(200).json({ users });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/u/user:
 *   put:
 *     summary: Update user data
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               username:
 *                 type: string
 *               club_or_association:
 *                 type: string
 *             example:
 *               user_id: "1"
 *               username: "JohnDoeUpdated"
 *               club_or_association: "Chess Club Updated"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/user", async (req: Request, res: Response) => {
    const { valid, error, decoded } = validateToken(req);
    if (!valid) {
        return res.status(401).json({ error });
    }

    const { user_id, username, club_or_association } = req.body;

    try {
        const result = await query(
            "UPDATE user_account SET user_name = $1, club_or_association = $2 WHERE user_id = $3 RETURNING user_id, user_name, club_or_association",
            [username, club_or_association, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = result.rows[0] as unknown as User;
        res.status(200).json({ user });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/u/user:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/user", async (req: Request, res: Response) => {
    const { valid, error, decoded } = validateToken(req);
    if (!valid) {
        return res.status(401).json({ error });
    }

    const { user_id } = req.query;

    try {
        const result = await query("DELETE FROM user_account WHERE user_id = $1", [user_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(204).json({});
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
