const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserByEmail,
} = require("../models/user");
const router = express.Router();
require("dotenv").config();
/**  
 * @swagger  
 * tags:  
 *   name: Authentication  
 *   description: Endpoints for user authentication and management  
 */  
  
/**  
 * @swagger  
 * /api/auth/register:  
 *   post:  
 *     summary: Register a new user  
 *     tags: [Authentication]  
 *     requestBody:  
 *       required: true  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             properties:  
 *               email:  
 *                 type: string  
 *                 format: email  
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
 *         description: Bad request  
 */  
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if the email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await createUser(email, hashedPassword, name, role);
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**  
 * @swagger  
 * /api/auth/users:  
 *   get:  
 *     summary: Get all users  
 *     tags: [Authentication]  
 *     responses:  
 *       200:  
 *         description: List of users  
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
router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**  
 * @swagger  
 * /api/auth/user/{id_user}:  
 *   get:  
 *     summary: Get user by ID  
 *     tags: [Authentication]  
 *     parameters:  
 *       - in: path  
 *         name: id_user  
 *         required: true  
 *         schema:  
 *           type: integer  
 *         description: User ID  
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
router.get("/user/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;
    const user = await getUserById(id_user);
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
/**  
 * @swagger  
 * /api/auth/user/update/{id_user}:  
 *   put:  
 *     summary: Update user by ID  
 *     tags: [Authentication]  
 *     parameters:  
 *       - in: path  
 *         name: id_user  
 *         required: true  
 *         schema:  
 *           type: integer  
 *         description: User ID  
 *     requestBody:  
 *       required: true  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             properties:  
 *               email:  
 *                 type: string  
 *                 format: email  
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
router.put("/user/update/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;
    const { email, password, name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await updateUserById(id_user, email, hashedPassword, name, role);
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
/**  
 * @swagger  
 * /api/auth/delete/{id_user}:  
 *   delete:  
 *     summary: Delete user by ID  
 *     tags: [Authentication]  
 *     parameters:  
 *       - in: path  
 *         name: id_user  
 *         required: true  
 *         schema:  
 *           type: integer  
 *         description: User ID  
 *     responses:  
 *       204:  
 *         description: User deleted successfully  
 *       404:  
 *         description: User not found  
 */  
router.delete("/user/delete/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;
    const user = await deleteUserById(id_user);
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
/**  
 * @swagger  
 * /api/auth/login:  
 *   post:  
 *     summary: Login user  
 *     tags: [Authentication]  
 *     requestBody:  
 *       required: true  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             properties:  
 *               email:  
 *                 type: string  
 *                 format: email  
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
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ id_user: user.id_user, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token, id_user: user.id_user, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;