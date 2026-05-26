const { Router } = require('express');
const { body, query } = require('express-validator');
const {
  getTasks, getStats, getTask,
  createTask, updateTask, deleteTask, deleteManyTasks,
} = require('../controllers/tasks.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

// ทุก route ต้อง login ก่อน
router.use(authenticate);

// GET /api/tasks/stats
router.get('/stats', getStats);

// GET /api/tasks?status=TODO&priority=HIGH&search=xxx&page=1&limit=10
router.get(
  '/',
  [
    query('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getTasks
);

// GET /api/tasks/:id
router.get('/:id', getTask);

// POST /api/tasks
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  createTask
);

// PUT /api/tasks/:id
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  updateTask
);

// DELETE /api/tasks/bulk
router.delete(
  '/bulk',
  [body('ids').isArray({ min: 1 }).withMessage('ids must be a non-empty array')],
  validate,
  deleteManyTasks
);

// DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

module.exports = router;
