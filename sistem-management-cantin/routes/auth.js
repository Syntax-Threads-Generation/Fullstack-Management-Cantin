// routes/auth.js  
const express = require('express');  
const bcrypt = require('bcryptjs');  
const jwt = require('jsonwebtoken');  
const { createUser, getAllUsers, getUserById, updateUserById, deleteUserById, getUserByEmail } = require('../models/user');  
const router = express.Router();  
const {verifyToken,authorizeRoles} = require('../middleware/auth');
require('dotenv').config();  
  
const JWT_SECRET = process.env.JWT_SECRET;  
  
/**  
 * @swagger  
 * tags:  
 *   name: Auth  
 *   description: Authentication management  
 */  
  
/**  
 * @swagger  
 * /api/auth/register:  
 *   post:  
 *     summary: Create a new user  
 *     tags: [Auth]  
 *     requestBody:  
 *       required: true  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             properties:  
 *               email:  
 *                 type: string  
 *               password:  
 *                 type: string  
 *               name:  
 *                 type: string  
 *               role:  
 *                 type: string  
 *                 enum: [SUPER_ADMIN, ADMIN]  
 *     responses:  
 *       201:  
 *         description: User created successfully  
 *         content:  
 *           application/json:  
 *             schema:  
 *               type: object  
 *               properties:  
 *                 id_user:  
 *                   type: integer  
 *                 email:  
 *                   type: string  
 *                 name:  
 *                   type: string  
 *                 role:  
 *                   type: string  
 *       400:  
 *         description: Invalid input  
 */  
router.post('/register', async (req, res) => {  
  const { email, password, name, role } = req.body;  
  const hashedPassword = await bcrypt.hash(password, 10);  
  const user = await createUser(email, hashedPassword, name, role);  
  res.status(201).json(user);  
});  
  
/**  
 * @swagger  
 * /api/auth/login:  
 *   post:  
 *     summary: Login user and get token  
 *     tags: [Auth]  
 *     requestBody:  
 *       required: true  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             properties:  
 *               email:  
 *                 type: string  
 *               password:  
 *                 type: string  
 *     responses:  
 *       200:  
 *         description: User logged in successfully  
 *         content:  
 *           application/json:  
 *             schema:  
 *               type: object  
 *               properties:  
 *                 token:  
 *                   type: string  
 *                 user:  
 *                   type: object  
 *                   properties:  
 *                     id_user:  
 *                       type: integer  
 *                     email:  
 *                       type: string  
 *                     name:  
 *                       type: string  
 *                     role:  
 *                       type: string  
 *       400:  
 *         description: Invalid email or password  
 */  
router.post('/login', async (req, res) => {  
  const { email, password } = req.body;  
  const user = await getUserByEmail(email);  
  if (!user) return res.status(400).json({ message: 'Invalid email or password' });  
  
  const isMatch = await bcrypt.compare(password, user.password);  
  if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });  
  
  const token = jwt.sign({ id_user: user.id_user, role: user.role }, JWT_SECRET, { expiresIn: '1h' });  
  res.json({ token, user });  
});  
  
/**  
 * @swagger  
 * /api/auth/users:  
 *   get:  
 *     summary: Get all users  
 *     tags: [Auth]  
 *     security:  
 *       - bearerAuth: []  
 *     responses:  
 *       200:  
 *         description: A list of users  
 *         content:  
 *           application/json:  
 *             schema:  
 *               type: array  
 *               items:  
 *                 type: object  
 *                 properties:  
 *                   id_user:  
 *                     type: integer  
 *                   email:  
 *                     type: string  
 *                   name:  
 *                     type: string  
 *                   role:  
 *                     type: string  
 */  
router.get('/users',verifyToken,authorizeRoles('SUPER_ADMIN'), async (req, res) => {  
  const users = await getAllUsers();  
  res.json(users);  
});  
  
/**  
 * @swagger  
 * /api/auth/user/{id_user}:  
 *   get:  
 *     summary: Get user by ID  
 *     tags: [Auth]  
 *     security:  
 *       - bearerAuth: []  
 *     parameters:  
 *       - in: path  
 *         name: id_user  
 *         required: true  
 *         description: Numeric ID of the user to get  
 *         schema:  
 *           type: integer  
 *     responses:  
 *       200:  
 *         description: User found  
 *         content:  
 *           application/json:  
 *             schema:  
 *               type: object  
 *               properties:  
 *                 id_user:  
 *                   type: integer  
 *                 email:  
 *                   type: string  
 *                 name:  
 *                   type: string  
 *                 role:  
 *                   type: string  
 *       404:  
 *         description: User not found  
 */  
router.get('/user/:id_user', async (req, res) => {  
  const { id_user } = req.params;  
  const user = await getUserById(id_user);  
  if (!user) return res.status(404).json({ message: 'User not found' });  
  res.json(user);  
});  
  
/**  
 * @swagger  
 * /api/auth/user/update/{id_user}:  
 *   put:  
 *     summary: Update user by ID  
 *     tags: [Auth]  
 *     security:  
 *       - bearerAuth: []  
 *     parameters:  
 *       - in: path  
 *         name: id_user  
 *         required: true  
 *         description: Numeric ID of the user to update  
 *         schema:  
 *           type: integer  
 *     requestBody:  
 *       required: true  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             properties:  
 *               email:  
 *                 type: string  
 *               password:  
 *                 type: string  
 *               name:  
 *                 type: string  
 *               role:  
 *                 type: string  
 *                 enum: [SUPER_ADMIN, ADMIN]  
 *     responses:  
 *       200:  
 *         description: User updated successfully  
 *         content:  
 *           application/json:  
 *             schema:  
 *               type: object  
 *               properties:  
 *                 id_user:  
 *                   type: integer  
 *                 email:  
 *                   type: string  
 *                 name:  
 *                   type: string  
 *                 role:  
 *                   type: string  
 *       404:  
 *         description: User not found  
 */  
router.put('/user/update/:id_user', async (req, res) => {  
  const { id_user } = req.params;  
  const { email, password, name, role } = req.body;  
  const hashedPassword = await bcrypt.hash(password, 10);  
  const user = await updateUserById(id_user, email, hashedPassword, name, role);  
  if (!user) return res.status(404).json({ message: 'User not found' });  
  res.json(user);  
});  
  
/**  
 * @swagger  
 * /api/auth/delete/{id_user}:  
 *   delete:  
 *     summary: Delete user by ID  
 *     tags: [Auth]  
 *     security:  
 *       - bearerAuth: []  
 *     parameters:  
 *       - in: path  
 *         name: id_user  
 *         required: true  
 *         description: Numeric ID of the user to delete  
 *         schema:  
 *           type: integer  
 *     responses:  
 *       204:  
 *         description: User deleted successfully  
 *       404:  
 *         description: User not found  
 */  
router.delete('/delete/:id_user', async (req, res) => {  
  const { id_user } = req.params;  
  const user = await getUserById(id_user);  
  if (!user) return res.status(404).json({ message: 'User not found' });  
  await deleteUserById(id_user);  
  res.status(204).send();  
});  
  
module.exports = router;  
