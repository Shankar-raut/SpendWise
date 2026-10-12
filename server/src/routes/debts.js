import { Router } from 'express';
import { ApiError, optionalText, requireAmount, requireDate, requireId, requireText } from '../utils/validation.js';

export function debtRoutes(debts, friends) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({ data: debts.list() });
  });

  router.post('/', (req, res) => {
    const debt = validateDebt(req.body);
    if (!friends.find(debt.friendId)) throw new ApiError(400, 'Friend does not exist.');
    res.status(201).json({ data: debts.create(debt) });
  });

  router.put('/:id', (req, res) => {
    const id = requireId(req.params.id);
    if (!debts.find(id)) throw new ApiError(404, 'Debt not found.');
    const debt = validateDebt(req.body);
    if (!friends.find(debt.friendId)) throw new ApiError(400, 'Friend does not exist.');
    res.json({ data: debts.update(id, debt) });
  });

  router.delete('/:id', (req, res) => {
    const deleted = debts.delete(requireId(req.params.id));
    if (!deleted) throw new ApiError(404, 'Debt not found.');
    res.status(204).send();
  });

  router.get('/:id/repayments', (req, res) => {
    const debtId = requireId(req.params.id);
    if (!debts.find(debtId)) throw new ApiError(404, 'Debt not found.');
    res.json({ data: debts.repayments(debtId) });
  });

  router.post('/:id/repayments', (req, res) => {
    const debtId = requireId(req.params.id);
    const debt = debts.find(debtId);
    if (!debt) throw new ApiError(404, 'Debt not found.');

    const repayment = {
      debtId,
      amount: requireAmount(req.body.amount),
      date: requireDate(req.body.date, 'Date'),
      notes: optionalText(req.body.notes, 'Notes')
    };

    if (repayment.amount > Math.round(debt.outstanding * 100)) {
      throw new ApiError(400, 'Repayment cannot exceed the outstanding balance.');
    }

    res.status(201).json({ data: debts.addRepayment(repayment) });
  });

  router.delete('/repayments/:id', (req, res) => {
    const deleted = debts.deleteRepayment(requireId(req.params.id));
    if (!deleted) throw new ApiError(404, 'Repayment not found.');
    res.status(204).send();
  });

  return router;
}

function validateDebt(body) {
  const direction = body.direction;
  if (!['i_owe', 'owes_me'].includes(direction)) {
    throw new ApiError(400, 'Direction must be i_owe or owes_me.');
  }

  return {
    friendId: requireId(body.friendId, 'Friend'),
    title: requireText(body.title, 'Title'),
    amount: requireAmount(body.amount),
    direction,
    date: requireDate(body.date, 'Date'),
    notes: optionalText(body.notes, 'Notes')
  };
}
