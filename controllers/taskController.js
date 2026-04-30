const Task = require('../models/Task');

// @desc    Get all tasks (with filter, search, sort)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, search, sort, priority } = req.query;

    const query = { user: req.user._id };

    // Filter by status
    if (status === 'completed') query.completed = true;
    else if (status === 'pending') query.completed = false;

    // Filter by priority
    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      query.priority = priority;
    }

    // Search by title or description
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'priority') {
      // High > Medium > Low
      sortOption = { priority: -1 };
    } else if (sort === 'dueDate') {
      sortOption = { dueDate: 1 };
    }

    const tasks = await Task.find(query).sort(sortOption);

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Check ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      priority,
      dueDate: dueDate || null,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { title, description, priority, dueDate, completed } = req.body;

    // Track completion timestamp
    if (completed !== undefined && completed !== task.completed) {
      req.body.completedAt = completed ? new Date() : null;
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
const toggleTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    res.json({
      success: true,
      message: `Task marked as ${task.completed ? 'completed' : 'pending'}.`,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await task.deleteOne();

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all completed tasks
// @route   DELETE /api/tasks/completed
// @access  Private
const deleteCompletedTasks = async (req, res, next) => {
  try {
    const result = await Task.deleteMany({
      user: req.user._id,
      completed: true,
    });

    res.json({
      success: true,
      message: `${result.deletedCount} completed task(s) deleted.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [total, completed, pending, overdue] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, completed: true }),
      Task.countDocuments({ user: userId, completed: false }),
      Task.countDocuments({
        user: userId,
        completed: false,
        dueDate: { $lt: now, $ne: null },
      }),
    ]);

    // Priority breakdown
    const priorityBreakdown = await Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        total,
        completed,
        pending,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        priorityBreakdown: priorityBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  deleteCompletedTasks,
  getStats,
};
