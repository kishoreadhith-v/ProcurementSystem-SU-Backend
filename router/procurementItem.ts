import express, { type Request, type Response } from 'express';
import query from '../util/db';
import { validateToken } from '../util/token';

const router = express.Router();

// TypeScript interfaces for request bodies
interface ProcurementItem {
    item_id?: number;
    item_name: string;
    item_count: number;
    item_category: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ProcurementItem:
 *       type: object
 *       properties:
 *         item_id:
 *           type: integer
 *           description: The unique ID of the item
 *         item_name:
 *           type: string
 *           description: The name of the item
 *         item_count:
 *           type: integer
 *           description: The quantity of the item
 *         item_category:
 *           type: string
 *           description: The category of the item
 *       required:
 *         - item_name
 *         - item_count
 *         - item_category
 * 
 * /api/p/procurement_items:
 *   get:
 *     summary: Get all procurement items or search by name/category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: item_name
 *         schema:
 *           type: string
 *         description: Filter items by name
 *       - in: query
 *         name: item_category
 *         schema:
 *           type: string
 *         description: Filter items by category
 *     responses:
 *       200:
 *         description: A list of procurement items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcurementItem'
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

    const item_name: string = req.query.item_name as string || '';
    const item_category: string = req.query.item_category as string || '';

    try {
        const queryText = `
      SELECT * FROM procurement_item 
      WHERE ($1::text = '' OR item_name ILIKE '%' || $1 || '%') 
      AND ($2::text = '' OR item_category ILIKE '%' || $2 || '%');
    `;
        const values = [item_name, item_category];
        const { rows } = await query(queryText, values);
        return res.status(200).json(rows);
    } catch (error: any) {
        console.error('Error executing query:', error.message);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/p/procurement_items:
 *   post:
 *     summary: Create a new procurement item
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcurementItem'
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcurementItem'
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

    const { item_name, item_count, item_category }: ProcurementItem = req.body;

    try {
        const { rows } = await query(
            'INSERT INTO procurement_item (item_name, item_count, item_category) VALUES ($1, $2, $3) RETURNING *',
            [item_name, item_count, item_category]
        );
        return res.status(201).json(rows[0]);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/p/procurement_items:
 *   put:
 *     summary: Update an existing procurement item
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcurementItem'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcurementItem'
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

    const { item_id, item_name, item_count, item_category }: ProcurementItem = req.body;

    try {
        const { rows } = await query(
            'UPDATE procurement_item SET item_name = $1, item_count = $2, item_category = $3 WHERE item_id = $4 RETURNING *',
            [item_name, item_count, item_category, item_id]
        );
        return res.status(200).json(rows[0]);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/p/procurement_items:
 *   delete:
 *     summary: Delete a procurement item
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item_id:
 *                 type: integer
 *                 description: The unique ID of the item
 *     responses:
 *       202:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
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

    const { item_id }: { item_id: number } = req.body;

    try {
        await query('DELETE FROM procurement_item WHERE item_id = $1', [item_id]);
        return res.status(202).json({
            message: `Item with ID ${item_id} has been deleted`,
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
