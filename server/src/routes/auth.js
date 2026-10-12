import { Router } from 'express';
import { createToken, verifyPassword } from '../utils/auth.js';
import { ApiError, requireText } from '../utils/validation.js';

export function publicAuthRoutes(users) {
  const router = Router();

  router.post('/login', (req, res) => {
    const email = requireText(req.body.email, 'Email', 120).toLowerCase();
    const password = requireText(req.body.password, 'Password', 120);
    const user = users.findByEmail(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    res.json({
      data: {
        token: createToken(user),
        user: publicUser(user)
      }
    });
  });

  return router;
}

export function privateAuthRoutes() {
  const router = Router();

  router.get('/me', (req, res) => {
    res.json({
      data: {
        id: req.user.sub,
        email: req.user.email,
        name: req.user.name
      }
    });
  });

  return router;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}
