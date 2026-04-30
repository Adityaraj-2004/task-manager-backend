const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  deleteCompletedTasks,
  getStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/error');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/stats', getStats);
router.delete('/completed', deleteCompletedTasks);

router
  .route('/')
  .get(getTasks)
  .post(
    [
      body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
      body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
      body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
    ],
    validate,
    createTask
  );

router
  .route('/:id')
  .get(getTask)
  .put(
    [
      body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }),
      body('priority').optional().isIn(['Low', 'Medium', 'High']),
      body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
    ],
    validate,
    updateTask
  )
  .delete(deleteTask);

router.patch('/:id/toggle', toggleTask);

module.exports = router;
