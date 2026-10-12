import { Router } from 'express';
import { ApiError, optionalText, requireId, requireText } from '../utils/validation.js';

export function friendRoutes(friends) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({ data: friends.list() });
  });

  router.post('/', (req, res) => {
    const friend = {
      name: requireText(req.body.name, 'Name', 80),
      email: optionalText(req.body.email, 'Email', 120)
    };
    res.status(201).json({ data: friends.create(friend) });
  });

  router.delete('/:id', (req, res) => {
    const deleted = friends.delete(requireId(req.params.id));
    if (!deleted) throw new ApiError(404, 'Friend not found.');
    res.status(204).send();
  });

  return router;
}
