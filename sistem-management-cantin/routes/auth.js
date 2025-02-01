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
router.post('/register',verifyToken,authorizeRoles('SUPER_ADMIN'), async (req, res) => {
  try{
    const { email, password, name, role } = req.body;  

    if(!email || !password || !name || !role){
      return res.status(400).json({ message: 'Please fill all the fields' });
    }

    if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if(!/(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}/.test(password)){
      return res.status(400).json({ message: 'Password must be at least 6 characters long and contain at least one uppercase letter, one number, and one special character' });
    }

    if(!['SUPER_ADMIN', 'ADMIN'].includes(role)){
      return res.status(400).json({ message: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);  
    const user = await createUser(email, hashedPassword, name, role);  
    res.status(201).json(user);
  }catch(error){
    console.error(error);
    res.status(400).json({ message:error.message });
  }
    
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
 *                 example: admin@admin.com
 *               password:  
 *                 type: string  
 *                 example: Admin12.
 *             required:  
 *               - email
 *               - password  
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
  try {  
    const { email, password } = req.body;  
    const user = await getUserByEmail(email);  
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });  

    const isMatch = await bcrypt.compare(password, user.password);  
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });  

    const token = jwt.sign({ id_user: user.id_user, role: user.role }, JWT_SECRET, { expiresIn: '1d' });  
    res.json({ token, user });  
  } catch (error) {  
    console.error(error);  
    res.status(500).json({ message: 'Internal server error' });  
  }  
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
 *       400:  
 *         description: Error retrieving users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error retrieving users 
 *       403:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token is required
 */  
router.get('/users',verifyToken,authorizeRoles('SUPER_ADMIN'), async (req, res) => {  
  try{
    const users = await getAllUsers();  
    res.status(200).json(users);  
  }catch(error){
    console.error(error);
    res.status(400).json({ message:error.message });
  }
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
router.get('/user/:id_user', verifyToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {  
  const { id_user } = req.params;  
  if (!id_user) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  if(!/^\d+$/.test(id_user)){
    return res.status(400).json({ message: 'User ID must be a number' });
  }
  try {
    const user = await getUserById(id_user);  
    if (!user) return res.status(404).json({ message: 'User not found' });  
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
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

  if(!/^\d+$/.test(id_user)){
    return res.status(400).json({ message: 'User ID must be a number' });
  }

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'Email, password, name and role are required' });
  }

  if (role && ![SUPER_ADMIN, ADMIN].includes(role)) {
    return res.status(400).json({ message: 'Role must be SUPER_ADMIN or ADMIN' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);  
  try {
    const user = await updateUserById(id_user, email, hashedPassword, name, role);  
    if (!user) return res.status(404).json({ message: 'User not found' });  
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
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
  if (!id_user) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  if(!/^\d+$/.test(id_user)){
    return res.status(400).json({ message: 'User ID must be a number' });
  }
  const user = await getUserById(id_user);  
  if (!user) return res.status(404).json({ message: 'User not found' });  
  await deleteUserById(id_user);  
  res.status(204).send();  
});  
  
module.exports = router;  
