import { Router } from 'express';
import { ApiError, optionalText, requireAmount, requireDate, requireId, requireText } from '../utils/validation.js';

export function expenseRoutes(expenses) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json({
      data: expenses.list({
        search: typeof req.query.search === 'string' ? req.query.search.trim() : '',
        category: typeof req.query.category === 'string' ? req.query.category.trim() : '',
        from: typeof req.query.from === 'string' && req.query.from ? requireDate(req.query.from, 'From date') : '',
        to: typeof req.query.to === 'string' && req.query.to ? requireDate(req.query.to, 'To date') : ''
      })
    });
  });

  router.get('/categories', (_req, res) => {
    res.json({ data: expenses.categories() });
  });

  router.post('/', (req, res) => {
    const expense = validateExpense(req.body);
    res.status(201).json({ data: expenses.create(expense) });
  });

  router.put('/:id', (req, res) => {
    const id = requireId(req.params.id);
    if (!expenses.find(id)) throw new ApiError(404, 'Expense not found.');
    res.json({ data: expenses.update(id, validateExpense(req.body)) });
  });

  router.delete('/:id', (req, res) => {
    const deleted = expenses.delete(requireId(req.params.id));
    if (!deleted) throw new ApiError(404, 'Expense not found.');
    res.status(204).send();
  });

  return router;
}

function validateExpense(body) {
  return {
    title: requireText(body.title, 'Title'),
    amount: requireAmount(body.amount),
    category: requireText(body.category, 'Category', 60),
    date: requireDate(body.date, 'Date'),
    notes: optionalText(body.notes, 'Notes')
  };
}
