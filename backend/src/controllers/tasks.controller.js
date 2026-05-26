const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ===== GET ALL TASKS (ของ user ที่ login อยู่) =====
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;

    const where = { userId: req.user.id };

    // Filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    // ดึงข้อมูลพร้อมนับ total (parallel)
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===== GET TASK STATS =====
const getStats = async (req, res, next) => {
  try {
    const stats = await prisma.task.groupBy({
      by: ['status'],
      where: { userId: req.user.id },
      _count: { status: true },
    });

    const result = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };

    stats.forEach((s) => {
      result[s.status] = s._count.status;
    });

    result.total = result.TODO + result.IN_PROGRESS + result.DONE;

    res.json({ stats: result });
  } catch (error) {
    next(error);
  }
};

// ===== GET SINGLE TASK =====
const getTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id, // ตรวจว่าเป็นเจ้าของ
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// ===== CREATE TASK =====
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user.id,
      },
    });

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    next(error);
  }
};

// ===== UPDATE TASK =====
const updateTask = async (req, res, next) => {
  try {
    // ตรวจว่าเป็นเจ้าของก่อน
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, status, priority, dueDate } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    res.json({ message: 'Task updated', task });
  } catch (error) {
    next(error);
  }
};

// ===== DELETE TASK =====
const deleteTask = async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// ===== DELETE MULTIPLE TASKS =====
const deleteManyTasks = async (req, res, next) => {
  try {
    const { ids } = req.body;

    const { count } = await prisma.task.deleteMany({
      where: {
        id: { in: ids },
        userId: req.user.id,
      },
    });

    res.json({ message: `${count} task(s) deleted` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getStats, getTask, createTask, updateTask, deleteTask, deleteManyTasks };
