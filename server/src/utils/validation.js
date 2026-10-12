export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function requireText(value, label, max = 120) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, `${label} is required.`);
  }

  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new ApiError(400, `${label} must be ${max} characters or less.`);
  }

  return trimmed;
}

export function optionalText(value, label, max = 500) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') {
    throw new ApiError(400, `${label} must be text.`);
  }

  return requireText(value, label, max);
}

export function requireAmount(value, label = 'Amount') {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, `${label} must be greater than 0.`);
  }

  return Math.round(amount * 100);
}

export function requireDate(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, `${label} must be a valid date.`);
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${label} must be a valid date.`);
  }

  return value;
}

export function requireId(value, label = 'ID') {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, `${label} is invalid.`);
  }

  return id;
}

export function parseAmount(cents) {
  return Number(cents || 0) / 100;
}
