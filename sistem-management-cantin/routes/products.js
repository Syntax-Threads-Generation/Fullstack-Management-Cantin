const express = require('express');
const { createProduct, getAllProducts, getProductById, updateProductById, deleteProductById } = require('../models/product');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

  
/**  
 * @swagger  
 * tags:  
 *   name: Products  
 *   description: Endpoints for managing products  
 */  
  
/**  
 * @swagger  
 * /api/products:  
 *   get:  
 *     summary: Get all products with pagination  
 *     tags: [Products]  
 *     parameters:  
 *       - in: query  
 *         name: page  
 *         schema:  
 *           type: integer  
 *           default: 1  
 *         description: Page number  
 *       - in: query  
 *         name: limit  
 *         schema:  
 *           type: integer  
 *           default: 10  
 *         description: Number of items per page  
 *     responses:  
 *       200:  
 *         description: List of products with pagination metadata  
 *         content:  
 *           application/json:  
 *             schema:  
 *               type: object  
 *               properties:  
 *                 products:  
 *                   type: array  
 *                   items:  
 *                     type: object  
 *                     properties:  
 *                       id_product:  
 *                         type: integer  
 *                       id_user:  
 *                         type: integer  
 *                       product_name:  
 *                         type: string  
 *                       product_price:  
 *                         type: integer  
 *                       categories:  
 *                         type: string  
 *                 totalProducts:  
 *                   type: integer  
 *                 currentPage:  
 *                   type: integer  
 *                 totalPages:  
 *                   type: integer  
 *       400:  
 *         description: Invalid page or limit parameter  
 */  
router.get('/', verifyToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {  
    try {  
        const page = req.query.page ? parseInt(req.query.page) : 1;  
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;  
  
        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {  
            return res.status(400).json({ error: 'Invalid page or limit parameter' });  
        }  
  
        const { products, totalProducts } = await getAllProducts(page, limit);  
        const totalPages = Math.ceil(totalProducts / limit);  
  
        res.json({  
            products,  
            totalProducts,  
            currentPage: page,  
            totalPages  
        });  
    } catch (error) {  
        console.error('Error fetching products:', error);  
        res.status(500).json({ error: error.message });  
    }  
}); 

/**  
 * @swagger  
 * /api/products/{id_product}:  
 *   get:  
 *     summary: Get product by ID  
 *     tags: [Products]  
 *     parameters:  
 *       - in: path  
 *         name: id_product  
 *         required: true  
 *         schema:  
 *           type: integer  
 *         description: Product ID  
 *     responses:  
 *       200:  
 *         description: Product found  
 *         content:  
 *           application/json:  
 *             schema:  
 *               type: object  
 *               properties:  
 *                 id_product:  
 *                   type: integer  
 *                 id_user:  
 *                   type: integer  
 *                 product_name:  
 *                   type: string  
 *                 product_price:  
 *                   type: integer  
 *                 categories:  
 *                   type: string  
 *       404:  
 *         description: Product not found  
 */  
router.get('/:id_product',verifyToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const id_product = req.params.id_product;
        const product = await getProductById(id_product);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**  
 * @swagger  
 * /api/products/create:  
 *   post:  
 *     summary: Create a new product  
 *     tags: [Products]  
 *     requestBody:  
 *       required: true  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             properties:  
 *               id_user:  
 *                 type: integer  
 *               product_name:  
 *                 type: string  
 *               product_price:  
 *                 type: integer  
 *               categories:  
 *                 type: string  
 *                 enum: [FOODS, DRINKS]  
 *     responses:  
 *       201:  
 *         description: Product created successfully  
 *         content:  
 *           application/json:  
 *             schema:  
 *               type: object  
 *               properties:  
 *                 id_product:  
 *                   type: integer  
 *                 id_user:  
 *                   type: integer  
 *                 product_name:  
 *                   type: string  
 *                 product_price:  
 *                   type: integer  
 *                 categories:  
 *                   type: string  
 *       400:  
 *         description: Bad request  
 */  
router.post('/create', verifyToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { id_user, product_name, product_price, categories } = req.body;

        if (!['FOODS', 'DRINKS'].includes(categories)) {
            return res.status(400).json({ error: 'Invalid category. Must be FOODS or DRINKS.' });
        }

        const product = await createProduct(id_user, product_name, product_price, categories);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**  
 * @swagger  
 * /api/products/update/{id_product}:  
 *   put:  
 *     summary: Update a product by ID  
 *     tags: [Products]  
 *     parameters:  
 *       - in: path  
 *         name: id_product  
 *         required: true  
 *         schema:  
 *           type: integer  
 *         description: Product ID  
 *     requestBody:  
 *       required: true  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             properties:  
 *               product_name:  
 *                 type: string  
 *               product_price:  
 *                 type: integer  
 *               categories:  
 *                 type: string  
 *                 enum: [FOODS, DRINKS]  
 *     responses:  
 *       200:  
 *         description: Product updated successfully  
 *         content:  
 *           application/json:  
 *             schema:  
 *               type: object  
 *               properties:  
 *                 id_product:  
 *                   type: integer  
 *                 id_user:  
 *                   type: integer  
 *                 product_name:  
 *                   type: string  
 *                 product_price:  
 *                   type: integer  
 *                 categories:  
 *                   type: string  
 *       400:  
 *         description: Bad request  
 *       404:  
 *         description: Product not found  
 */
router.put('/update/:id_product', verifyToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const id_product = req.params.id_product;
        const { product_name, product_price, categories } = req.body;

        if (!['FOODS', 'DRINKS'].includes(categories)) {
            return res.status(400).json({ error: 'Invalid category. Must be FOODS or DRINKS.' });
        }

        const product = await updateProductById(id_product, product_name, product_price, categories);
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**  
 * @swagger  
 * /api/products/delete/{id_product}:  
 *   delete:  
 *     summary: Delete a product by ID  
 *     tags: [Products]  
 *     parameters:  
 *       - in: path  
 *         name: id_product  
 *         required: true  
 *         schema:  
 *           type: integer  
 *         description: Product ID  
 *     responses:  
 *       204:  
 *         description: Product deleted successfully  
 *       404:  
 *         description: Product not found  
 */
router.delete('/delete/:id_product', verifyToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const id_product = req.params.id_product;
        const product = await deleteProductById(id_product);
        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.sendStatus(204);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;