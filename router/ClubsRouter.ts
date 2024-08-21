import express, { type Request, type Response } from 'express';
import query from '../util/db';
import { validateToken } from '../util/token';

const router = express.Router();

// TypeScript interfaces for request bodies
interface Club {
    club_id?: number;
    club_name: string;
}

// GET all clubs
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

// POST (Create a new club)
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

// PUT (Update an existing club)
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

// DELETE (Delete an existing club)
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
