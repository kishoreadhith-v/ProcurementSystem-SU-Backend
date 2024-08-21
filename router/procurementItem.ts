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

// GET all procurement_item or search by name/category
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

// POST (Create a new item)
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

// PUT (Update an existing item)
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

// DELETE (Delete an item)
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
