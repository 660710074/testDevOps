const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper: สร้าง JWT
const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper: ซ่อน password ก่อนส่งกลับ
const sanitizeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// ===== REGISTER =====
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ตรวจ email ซ้ำ
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // สร้าง user
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const token = signToken(user.id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ===== LOGIN =====
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // หา user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // ใช้ข้อความเดียวกัน ป้องกัน user enumeration
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ตรวจ password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ===== GET ME (ดึงข้อมูล user ปัจจุบัน) =====
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { tasks: true } },
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// ===== CHANGE PASSWORD =====
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, changePassword };
