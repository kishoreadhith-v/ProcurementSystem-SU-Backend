import express, { type Request, type Response } from 'express';
import query from '../util/db';
import { validateToken } from '../util/token';

const router = express.Router();

// TypeScript interfaces for request bodies
interface Club {
    club_id?: number;
    club_name: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Club:
 *       type: object
 *       properties:
 *         club_id:
 *           type: integer
 *           description: The unique ID of the club
 *         club_name:
 *           type: string
 *           description: The name of the club
 *       required:
 *         - club_name
 * 
 * /api/c/:
 *   get:
 *     summary: Get all clubs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of clubs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Club'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req: Request, res: Response) => {
    const { valid, error } = validateToken(req);
    if (!valid) {
        return res.status(401).json({ error });
    }

    try {
        const { rows } = await query('SELECT * FROM clubs', []);
        return res.status(200).json(rows);
    } catch (error: any) {
        console.error('Error executing query:', error.message);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/c/:
 *   post:
 *     summary: Create a new club
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Club'
 *     responses:
 *       201:
 *         description: Club created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req: Request, res: Response) => {
    const { valid, error } = validateToken(req);
    if (!valid) {
        return res.status(401).json({ error });
    }

    const { club_name }: Club = req.body;

    try {
        const { rows } = await query(
            'INSERT INTO clubs (club_name) VALUES ($1) RETURNING *',
            [club_name]
        );
        return res.status(201).json(rows[0]);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/c/:
 *   put:
 *     summary: Update an existing club
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Club'
 *     responses:
 *       200:
 *         description: Club updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/', async (req: Request, res: Response) => {
    const { valid, error } = validateToken(req);
    if (!valid) {
        return res.status(401).json({ error });
    }

    const { club_id, club_name }: Club = req.body;

    try {
        const { rows } = await query(
            'UPDATE clubs SET club_name = $1 WHERE club_id = $2 RETURNING *',
            [club_name, club_id]
        );
        return res.status(200).json(rows[0]);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/c/:
 *   delete:
 *     summary: Delete an existing club
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               club_id:
 *                 type: integer
 *                 description: The unique ID of the club
 *     responses:
 *       200:
 *         description: Club deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/', async (req: Request, res: Response) => {
    const { valid, error } = validateToken(req);
    if (!valid) {
        return res.status(401).json({ error });
    }

    const { club_id }: { club_id: number } = req.body;

    try {
        const { rows } = await query(
            'DELETE FROM clubs WHERE club_id = $1 RETURNING *',
            [club_id]
        );
        return res.status(200).json(rows[0]);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
