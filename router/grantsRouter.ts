import express, { type Request, type Response } from 'express';
import query from '../util/db';
import { validateToken } from '../util/token';

const router = express.Router();

// TypeScript interfaces for request bodies
interface GrantRequest {
    user_id: number;
    procurement_id: number;
    count: number;
    club_id: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     GrantRequest:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The ID of the user requesting the grant
 *         procurement_id:
 *           type: integer
 *           description: The ID of the procurement item
 *         count:
 *           type: integer
 *           description: The number of items requested
 *         club_id:
 *           type: integer
 *           description: The ID of the club
 *       required:
 *         - user_id
 *         - procurement_id
 *         - count
 *         - club_id
 * 
 * /api/g:
 *   get:
 *     summary: Get all grants
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of grants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GrantRequest'
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
        const { rows } = await query('SELECT * FROM grants', []);
        return res.status(200).json(rows);
    } catch (error: any) {
        console.error('Error executing query:', error.message);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/g:
 *   post:
 *     summary: Create a new grant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GrantRequest'
 *     responses:
 *       201:
 *         description: Grant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrantRequest'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Procurement item not found
 *       400:
 *         description: Insufficient count of procurement item
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req: Request, res: Response) => {
    const { valid, error } = validateToken(req);
    if (!valid) {
        return res.status(401).json({ error });
    }

    const { user_id, procurement_id, count, club_id }: GrantRequest = req.body;

    try {
        // Check if the procurement item exists
        const { rows: procurementRows } = await query(
            'SELECT * FROM procurement_item WHERE item_id = $1',
            [procurement_id]
        );
        if (procurementRows.length === 0) {
            return res.status(404).json({ error: 'Procurement item not found' });
        }

        // Check if there is enough count available
        if ((procurementRows[0] as unknown as { item_count: number })?.item_count < count) {
            return res.status(400).json({ error: 'Insufficient count' });
        }

        // Create the grant
        const { rows: grantRows } = await query(
            'INSERT INTO grants (user_id, procurement_id, count, club_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, procurement_id, count, club_id]
        );

        // Decrement the item count from the procurement_item table
        await query(
            'UPDATE procurement_item SET item_count = item_count - $1 WHERE item_id = $2',
            [count, procurement_id]
        );

        return res.status(201).json(grantRows[0]);
    } catch (error: any) {
        console.error('Error processing grant:', error.message);
        return res.status(500).json({ error: error.message });
    }
});

export default router;
