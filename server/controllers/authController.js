const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');

const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Passwords are never stored directly; only the bcrypt hash goes to MySQL.
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await dbService.createUser(fullName, email, passwordHash);

    // The token is what the frontend sends back for protected routes.
    const secret = process.env.JWT_SECRET || 'pdf_chatbot_secret_key_2026_secure';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      secret,
      { expiresIn }
    );

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // The public user lookup excludes passwordHash, so load it only when checking login.
    const fullUser = await dbService.findUserByIdWithPassword(user.id);
    if (!fullUser) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, fullUser.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const secret = process.env.JWT_SECRET || 'pdf_chatbot_secret_key_2026_secure';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await dbService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await dbService.findUserByIdWithPassword(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await dbService.updateUserPassword(req.user.id, newPasswordHash);

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword
};
