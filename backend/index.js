const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'erp_system',
  password: 'usman123', // Change this to your PostgreSQL password
  port: 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// Helper function for database queries
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// ==============================
// AUTHENTICATION
// ==============================
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    
    if (result.rows.length > 0) {
      return res.json({ ok: true, user: { username } });
    }
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ==============================
// PRODUCTS
// ==============================
app.post('/api/products', async (req, res) => {
  const { name, quantity } = req.body;
  if (!name) return res.status(400).json({ ok: false, message: 'Name required' });
  
  try {
    const result = await query(
      'INSERT INTO products (name, quantity) VALUES ($1, $2) RETURNING *',
      [name, Number(quantity || 0)]
    );
    res.json({ ok: true, prod: result.rows[0] });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ ok: true, products: result.rows });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ==============================
// CUSTOMERS
// ==============================
app.post('/api/customers', async (req, res) => {
  const { name, location, previousPending } = req.body;
  if (!name) return res.status(400).json({ ok: false, message: 'Name required' });
  
  try {
    const result = await query(
      'INSERT INTO customers (name, location, previous_pending) VALUES ($1, $2, $3) RETURNING *',
      [name, location || '', Number(previousPending || 0)]
    );
    res.json({ ok: true, customer: result.rows[0] });
  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const result = await query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json({ ok: true, customers: result.rows });
  } catch (error) {
    console.error('Customers fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.post('/api/customers/:id/update-pending', async (req, res) => {
  const id = req.params.id;
  const { newPending } = req.body;
  
  try {
    const result = await query(
      'UPDATE customers SET previous_pending = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [Number(newPending || 0), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Customer not found' });
    }
    
    res.json({ ok: true, customer: result.rows[0] });
  } catch (error) {
    console.error('Customer update error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const customerResult = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (customerResult.rows.length === 0) {
      return res.json({ ok: false, message: 'Customer not found' });
    }
    
    const customer = customerResult.rows[0];
    
    await query(
      'INSERT INTO recycle_bin_customers (id, name, location, previous_pending) VALUES ($1, $2, $3, $4)',
      [customer.id, customer.name, customer.location, customer.previous_pending]
    );
    
    await query('DELETE FROM customers WHERE id = $1', [id]);
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Customer delete error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ==============================
// CALCULATIONS
// ==============================
function calcLines(list) {
  const lines = list.map((p, idx) => {
    const qty = Number(p.quantity || p.qty || 0);
    const weight = Number(p.weight || 0);
    const price = Number(p.pricePerKg || p.price || 0);
    const lineTotal = +(qty * price).toFixed(2);
    return { ...p, lineTotal, idx };
  });
  const customerTotal = +(lines.reduce((s, l) => s + l.lineTotal, 0)).toFixed(2);
  return { lines, customerTotal };
}

app.post('/api/calculate-invoice', (req, res) => {
  const { products: prodList, previousPending } = req.body;
  if (!Array.isArray(prodList)) return res.status(400).json({ ok: false, message: 'products must be array' });
  
  const calc = calcLines(prodList);
  const grandTotal = +(calc.customerTotal + Number(previousPending || 0)).toFixed(2);
  res.json({ ...calc, previousPending: Number(previousPending || 0), grandTotal });
});

// ==============================
// SALES
// ==============================
app.post('/api/save-sale', async (req, res) => {
  const { customerId, customerName, previousPending, products: prodList, paidNow } = req.body;
  
  try {
    const calc = calcLines(prodList);
    const grandTotal = +(calc.customerTotal + Number(previousPending || 0)).toFixed(2);
    const paid = Number(paidNow || 0);
    const remaining = +(grandTotal - paid).toFixed(2);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const saleResult = await client.query(
        `INSERT INTO sales (customer_id, customer_name, previous_pending, total_sale, grand_total, paid_now, pending) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [customerId || null, customerName || '', Number(previousPending || 0), calc.customerTotal, grandTotal, paid, remaining]
      );

      const sale = saleResult.rows[0];

      for (const item of calc.lines) {
        await client.query(
          `INSERT INTO sale_items (sale_id, product_name, quantity, weight, price_per_kg, line_total) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [sale.id, item.productName, item.quantity, item.weight, item.pricePerKg, item.lineTotal]
        );
      }

      if (customerId) {
        await client.query(
          'UPDATE customers SET previous_pending = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [remaining, customerId]
        );
      }

      await client.query('COMMIT');
      
      const completeSale = await getSaleWithItems(sale.id);

      const formattedSale = {
        id: completeSale.id,
        customerId: completeSale.customer_id,
        customerName: completeSale.customer_name || '',
        date: completeSale.date,
        previousPending: completeSale.previous_pending,
        totalSale: completeSale.total_sale,
        grandTotal: completeSale.grand_total,
        paidNow: completeSale.paid_now,
        pending: completeSale.pending,
        products: completeSale.products
      };

      res.json({ ok: true, record: completeSale });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Save sale error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

async function getSaleWithItems(saleId) {
  const saleResult = await query('SELECT * FROM sales WHERE id = $1', [saleId]);
  if (saleResult.rows.length === 0) return null;
  
  const sale = saleResult.rows[0];
  const itemsResult = await query('SELECT * FROM sale_items WHERE sale_id = $1', [saleId]);

  sale.products = itemsResult.rows.map(item => ({
    productName: item.product_name,
    quantity: item.quantity,
    weight: item.weight,
    pricePerKg: item.price_per_kg,
    lineTotal: item.line_total
  }));
  
  return sale;
}

app.get('/api/sales', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        s.id,
        s.customer_id as "customerId",
        s.customer_name as "customerName",
        s.date,
        s.previous_pending as "previousPending",
        s.total_sale as "totalSale",
        s.grand_total as "grandTotal",
        s.paid_now as "paidNow",
        s.pending,
        json_agg(
          json_build_object(
            'productName', si.product_name,
            'quantity', si.quantity,
            'weight', si.weight,
            'pricePerKg', si.price_per_kg,
            'lineTotal', si.line_total
          )
        ) as products
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      GROUP BY 
        s.id,
        s.customer_id,
        s.customer_name,
        s.date,
        s.previous_pending,
        s.total_sale,
        s.grand_total,
        s.paid_now,
        s.pending
      ORDER BY s.date DESC
    `);
    
    const sales = result.rows.map(row => ({
      id: row.id,
      customerId: row.customerId,
      customerName: row.customerName || '',
      date: row.date,
      previousPending: row.previousPending,
      totalSale: row.totalSale,
      grandTotal: row.grandTotal,
      paidNow: row.paidNow,
      pending: row.pending,
      products: row.products[0] ? row.products : []
    }));
    
    res.json({ ok: true, sales });

  } catch (error) {
    console.error('Sales fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.delete('/api/sales/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const saleResult = await client.query(`
        SELECT 
          s.id,
          s.customer_id,
          s.customer_name,
          s.previous_pending,
          s.total_sale,
          s.grand_total,
          s.paid_now,
          s.pending,
          s.date,
          json_agg(
            json_build_object(
              'productName', si.product_name,
              'quantity', si.quantity,
              'weight', si.weight,
              'pricePerKg', si.price_per_kg,
              'lineTotal', si.line_total
            )
          ) as products
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        WHERE s.id = $1
        GROUP BY s.id
      `, [id]);


      if (saleResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ ok: false, message: 'Sale not found' });
      }

      const sale = saleResult.rows[0];

      await client.query(
        `INSERT INTO recycle_bin_sales (id, customer_id, customer_name, previous_pending, total_sale, grand_total, paid_now, pending, date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          sale.id, 
          sale.customer_id, 
          sale.customer_name, 
          sale.previous_pending, 
          sale.total_sale, 
          sale.grand_total, 
          sale.paid_now, 
          sale.pending, 
          sale.date
        ]
      );

      await client.query('DELETE FROM sale_items WHERE sale_id = $1', [id]);
      await client.query('DELETE FROM sales WHERE id = $1', [id]);

      await client.query('COMMIT');
      res.json({ ok: true });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Sale delete error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ==============================
// PURCHASES
// ==============================
app.post('/api/save-purchase', async (req, res) => {
  const { vendorName, products, paidNow, modeOfPayment } = req.body;

  if (!vendorName) {
    return res.json({ ok: false, message: 'vendorName is required' });
  }
  if (!Array.isArray(products) || products.length === 0) {
    return res.json({ ok: false, message: 'products array is required' });
  }

  try {
    const normalizedProducts = products.map(p => {
      const qty = Number(p.qty || p.quantity || 0);
      const weight = Number(p.weight || 0);
      const pricePerKg = Number(p.pricePerKg || p.price || 0);
      const lineTotal = +(qty  * pricePerKg).toFixed(2);
      return {
        productName: p.productName,
        qty,
        weight,
        pricePerKg,
        lineTotal,
      };
    });

    const grandTotal = normalizedProducts.reduce((sum, p) => sum + p.lineTotal, 0);
    const paid = Number(paidNow || 0);
    const pending = +(grandTotal - paid).toFixed(2);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const purchaseResult = await client.query(
        `INSERT INTO purchases (vendor_name, grand_total, paid_now, pending, mode_of_payment) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [vendorName, grandTotal, paid, pending, modeOfPayment || 'cash']
      );

      const purchase = purchaseResult.rows[0];

      for (const item of normalizedProducts) {
        await client.query(
          `INSERT INTO purchase_items (purchase_id, product_name, qty, weight, price_per_kg, line_total) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [purchase.id, item.productName, item.qty, item.weight, item.pricePerKg, item.lineTotal]
        );
      }

      await client.query('COMMIT');
      
      const completePurchase = await getPurchaseWithItems(purchase.id);
      res.json({ ok: true, record: completePurchase });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Save purchase error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

async function getPurchaseWithItems(purchaseId) {
  const purchaseResult = await query('SELECT * FROM purchases WHERE id = $1', [purchaseId]);
  if (purchaseResult.rows.length === 0) return null;
  
  const purchase = purchaseResult.rows[0];
  const itemsResult = await query('SELECT * FROM purchase_items WHERE purchase_id = $1', [purchaseId]);
  purchase.products = itemsResult.rows;
  
  return purchase;
}

app.get('/api/purchases', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, 
             json_agg(
               json_build_object(
                 'productName', pi.product_name,
                 'qty', pi.qty,
                 'weight', pi.weight,
                 'pricePerKg', pi.price_per_kg,
                 'lineTotal', pi.line_total
               )
             ) as products
      FROM purchases p
      LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
      GROUP BY p.id
      ORDER BY p.date DESC
    `);
    
    const purchases = result.rows.map(row => ({
      ...row,
      products: row.products[0] ? row.products : []
    }));
    
    res.json({ ok: true, purchases });
  } catch (error) {
    console.error('Purchases fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.get('/api/purchases-with-pending', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, 
             json_agg(
               json_build_object(
                 'productName', pi.product_name,
                 'qty', pi.qty,
                 'weight', pi.weight,
                 'pricePerKg', pi.price_per_kg,
                 'lineTotal', pi.line_total
               )
             ) as products
      FROM purchases p
      LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
      WHERE p.pending > 0
      GROUP BY p.id
      ORDER BY p.date DESC
    `);
    
    const purchases = result.rows.map(row => ({
      ...row,
      products: row.products[0] ? row.products : []
    }));
    
    res.json({ ok: true, purchases });
  } catch (error) {
    console.error('Pending purchases fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.put('/api/purchases/:id', async (req, res) => {
  const { id } = req.params;
  const { vendorName, paidNow, modeOfPayment, products } = req.body;

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const currentResult = await client.query('SELECT * FROM purchases WHERE id = $1', [id]);
      if (currentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.json({ ok: false, message: 'Purchase not found' });
      }

      const oldPurchase = currentResult.rows[0];

      let newProducts = oldPurchase.products || [];
      let grandTotal = Number(oldPurchase.grand_total || 0);

      if (Array.isArray(products) && products.length > 0) {
        await client.query('DELETE FROM purchase_items WHERE purchase_id = $1', [id]);

        for (const item of products) {
          const qty = Number(item.qty || item.quantity || 0);
          const weight = Number(item.weight || 0);
          const pricePerKg = Number(item.pricePerKg || item.price || 0);
          const lineTotal = +(qty * pricePerKg).toFixed(2);
          
          await client.query(
            `INSERT INTO purchase_items (purchase_id, product_name, qty, weight, price_per_kg, line_total) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, item.productName, qty, weight, pricePerKg, lineTotal]
          );
        }

        const itemsResult = await client.query(
          'SELECT SUM(line_total) as total FROM purchase_items WHERE purchase_id = $1',
          [id]
        );
        grandTotal = Number(itemsResult.rows[0].total || 0);
      }

      const newPaid = paidNow !== undefined ? Number(paidNow || 0) : Number(oldPurchase.paid_now || 0);
      const pending = +(grandTotal - newPaid).toFixed(2);

      const updateResult = await client.query(
        `UPDATE purchases 
         SET vendor_name = $1, grand_total = $2, paid_now = $3, pending = $4, mode_of_payment = $5 
         WHERE id = $6 RETURNING *`,
        [
          vendorName !== undefined ? vendorName : oldPurchase.vendor_name,
          grandTotal,
          newPaid,
          pending,
          modeOfPayment || oldPurchase.mode_of_payment,
          id
        ]
      );

      await client.query('COMMIT');
      
      const updatedPurchase = await getPurchaseWithItems(id);
      res.json({ ok: true, record: updatedPurchase });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Purchase update error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.delete('/api/purchases/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const purchaseResult = await client.query(`
        SELECT p.*, 
               json_agg(
                 json_build_object(
                   'productName', pi.product_name,
                   'qty', pi.qty,
                   'weight', pi.weight,
                   'pricePerKg', pi.price_per_kg,
                   'lineTotal', pi.line_total
                 )
               ) as products
        FROM purchases p
        LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [id]);

      if (purchaseResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.json({ ok: false, message: 'Purchase not found' });
      }

      const purchase = purchaseResult.rows[0];

      await client.query(
        `INSERT INTO recycle_bin_purchases (id, vendor_name, grand_total, paid_now, pending, mode_of_payment, date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [purchase.id, purchase.vendor_name, purchase.grand_total, purchase.paid_now, purchase.pending, purchase.mode_of_payment, purchase.date]
      );

      await client.query('DELETE FROM purchase_items WHERE purchase_id = $1', [id]);
      await client.query('DELETE FROM purchases WHERE id = $1', [id]);

      await client.query('COMMIT');
      res.json({ ok: true });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Purchase delete error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ==============================
// VENDORS
// ==============================
app.get("/api/vendors", async (req, res) => {
  try {
    const result = await query('SELECT * FROM vendors ORDER BY created_at DESC');
    res.json({ ok: true, vendors: result.rows });
  } catch (error) {
    console.error('Vendors fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.post("/api/vendors", async (req, res) => {
  const { id, name, place, company } = req.body;

  if (!name) {
    return res.json({ ok: false, message: "Vendor name is required" });
  }

  try {
    if (id) {
      const result = await query(
        'UPDATE vendors SET name = $1, place = $2, company = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [name, place || "", company || "", id]
      );
      
      if (result.rows.length === 0) {
        return res.json({ ok: false, message: "Vendor not found" });
      }
      
      res.json({ ok: true, vendor: result.rows[0] });
    } else {
      const result = await query(
        'INSERT INTO vendors (name, place, company) VALUES ($1, $2, $3) RETURNING *',
        [name, place || "", company || ""]
      );
      res.json({ ok: true, vendor: result.rows[0] });
    }
  } catch (error) {
    console.error('Vendor save error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.delete('/api/vendors/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const vendorResult = await client.query('SELECT * FROM vendors WHERE id = $1', [id]);
      if (vendorResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.json({ ok: false, message: 'Vendor not found' });
      }

      const vendor = vendorResult.rows[0];

      await client.query(
        'INSERT INTO recycle_bin_vendors (id, name, place, company, remaining) VALUES ($1, $2, $3, $4, $5)',
        [vendor.id, vendor.name, vendor.place, vendor.company, vendor.remaining]
      );

      await client.query('DELETE FROM vendor_transactions WHERE vendor_id = $1', [id]);
      await client.query('DELETE FROM vendors WHERE id = $1', [id]);

      await client.query('COMMIT');
      res.json({ ok: true });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Vendor delete error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ==============================
// VENDOR TRANSACTIONS & LEDGER
// ==============================
async function recomputeVendorLedger(vendorId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const ledgerResult = await client.query(
      'SELECT * FROM vendor_transactions WHERE vendor_id = $1 ORDER BY date, created_at',
      [vendorId]
    );

    let balance = 0;
    const ledger = [];

    for (const tx of ledgerResult.rows) {
      const amt = Number(tx.amount || 0);
      if (tx.type === "received") {
        balance += amt;
      } else if (tx.type === "paid" || tx.type === "goods") {
        balance -= amt;
      }

      await client.query(
        'UPDATE vendor_transactions SET balance_after = $1 WHERE id = $2',
        [balance, tx.id]
      );

      ledger.push({
        ...tx,
        balance_after: balance
      });
    }

    await client.query(
      'UPDATE vendors SET remaining = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [balance, vendorId]
    );

    await client.query('COMMIT');
    return ledger;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

app.get("/api/vendors/:id/ledger", async (req, res) => {
  const vendorId = req.params.id;
  
  try {
    const vendorResult = await query('SELECT * FROM vendors WHERE id = $1', [vendorId]);
    if (vendorResult.rows.length === 0) {
      return res.json({ ok: false, message: "Vendor not found" });
    }

    const ledger = await recomputeVendorLedger(vendorId);
    const vendor = vendorResult.rows[0];

    res.json({ ok: true, vendor, ledger });
  } catch (error) {
    console.error('Ledger fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.post("/api/vendors/:id/transactions", async (req, res) => {
  const vendorId = req.params.id;
  const { type, amount, method, billRef, date } = req.body;

  try {
    const vendorResult = await query('SELECT * FROM vendors WHERE id = $1', [vendorId]);
    if (vendorResult.rows.length === 0) {
      return res.json({ ok: false, message: "Vendor not found" });
    }

    const amt = Number(amount || 0);

    if (!["received", "paid", "goods"].includes(type)) {
      return res.json({ ok: false, message: "Invalid transaction type" });
    }
    if (amt <= 0) {
      return res.json({ ok: false, message: "Amount must be > 0" });
    }
    if ((type === "received" || type === "paid") && !method) {
      return res.json({ ok: false, message: "Payment method is required" });
    }

    const result = await query(
      `INSERT INTO vendor_transactions (vendor_id, type, amount, method, bill_ref, date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [vendorId, type, amt, method || "", billRef || "", date || new Date().toISOString()]
    );

    const ledger = await recomputeVendorLedger(vendorId);
    const vendor = await query('SELECT * FROM vendors WHERE id = $1', [vendorId]);

    res.json({ ok: true, vendor: vendor.rows[0], ledger });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.put("/api/vendors/:vendorId/transactions/:txId", async (req, res) => {
  const { vendorId, txId } = req.params;
  const { type, amount, method, billRef, date } = req.body;

  try {
    const vendorResult = await query('SELECT * FROM vendors WHERE id = $1', [vendorId]);
    if (vendorResult.rows.length === 0) {
      return res.json({ ok: false, message: "Vendor not found" });
    }

    const txResult = await query(
      'SELECT * FROM vendor_transactions WHERE id = $1 AND vendor_id = $2',
      [txId, vendorId]
    );
    if (txResult.rows.length === 0) {
      return res.json({ ok: false, message: "Transaction not found" });
    }

    const amt = Number(amount || 0);

    if (!["received", "paid", "goods"].includes(type)) {
      return res.json({ ok: false, message: "Invalid transaction type" });
    }
    if (amt <= 0) {
      return res.json({ ok: false, message: "Amount must be > 0" });
    }
    if ((type === "received" || type === "paid") && !method) {
      return res.json({ ok: false, message: "Payment method is required" });
    }

    await query(
      `UPDATE vendor_transactions 
       SET type = $1, amount = $2, method = $3, bill_ref = $4, date = $5 
       WHERE id = $6 AND vendor_id = $7`,
      [type, amt, method || "", billRef || "", date || new Date().toISOString(), txId, vendorId]
    );

    const ledger = await recomputeVendorLedger(vendorId);
    const vendor = await query('SELECT * FROM vendors WHERE id = $1', [vendorId]);

    res.json({ ok: true, vendor: vendor.rows[0], ledger });
  } catch (error) {
    console.error('Transaction update error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.delete("/api/vendors/:vendorId/transactions/:txId", async (req, res) => {
  const { vendorId, txId } = req.params;

  try {
    const vendorResult = await query('SELECT * FROM vendors WHERE id = $1', [vendorId]);
    if (vendorResult.rows.length === 0) {
      return res.json({ ok: false, message: "Vendor not found" });
    }

    const result = await query(
      'DELETE FROM vendor_transactions WHERE id = $1 AND vendor_id = $2',
      [txId, vendorId]
    );

    if (result.rowCount === 0) {
      return res.json({ ok: false, message: "Transaction not found" });
    }

    const ledger = await recomputeVendorLedger(vendorId);
    const vendor = await query('SELECT * FROM vendors WHERE id = $1', [vendorId]);

    res.json({ ok: true, vendor: vendor.rows[0], ledger });
  } catch (error) {
    console.error('Transaction delete error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ==============================
// STOCK MANAGEMENT
// ==============================
async function applyStockDelta(type, recordId, line, date) {
  const productName = line.productName || 'Unknown';
  const bagWeight = Number(line.weight || 0);
  const qtyBags = Number(line.quantity || line.qty || 0);

  if (!qtyBags || !bagWeight) return;

  const delta = type === 'purchase' ? qtyBags : -qtyBags;

  const stockResult = await query(
    'SELECT * FROM stock WHERE product_name = $1 AND bag_weight = $2',
    [productName, bagWeight]
  );

  if (stockResult.rows.length === 0) {
    await query(
      'INSERT INTO stock (product_name, bag_weight, bags, total_weight) VALUES ($1, $2, $3, $4)',
      [productName, bagWeight, delta, delta * bagWeight]
    );
  } else {
    const current = stockResult.rows[0];
    const newBags = current.bags + delta;
    await query(
      'UPDATE stock SET bags = $1, total_weight = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [newBags, newBags * bagWeight, current.id]
    );
  }

  await query(
    'INSERT INTO stock_movements (type, record_id, product_name, bag_weight, qty_bags, date) VALUES ($1, $2, $3, $4, $5, $6)',
    [type, recordId, productName, bagWeight, delta, date]
  );
}

async function recomputeStockFromHistory() {
  await query('DELETE FROM stock');
  await query('DELETE FROM stock_movements');

  const events = [];

  const purchasesResult = await query('SELECT * FROM purchases');
  const salesResult = await query('SELECT * FROM sales');

  purchasesResult.rows.forEach(p => {
    events.push({
      date: p.date || new Date().toISOString(),
      type: 'purchase',
      record: p
    });
  });

  salesResult.rows.forEach(s => {
    events.push({
      date: s.date || new Date().toISOString(),
      type: 'sale',
      record: s
    });
  });

  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  for (const ev of events) {
    const itemsResult = await query(
      ev.type === 'purchase' 
        ? 'SELECT * FROM purchase_items WHERE purchase_id = $1'
        : 'SELECT * FROM sale_items WHERE sale_id = $1',
      [ev.record.id]
    );

    for (const item of itemsResult.rows) {
      await applyStockDelta(ev.type, ev.record.id, {
        productName: item.product_name,
        weight: item.weight,
        quantity: ev.type === 'purchase' ? item.qty : item.quantity
      }, ev.record.date);
    }
  }
}

app.get('/api/stock', async (req, res) => {
  try {
    await recomputeStockFromHistory();
    const result = await query('SELECT * FROM stock ORDER BY product_name, bag_weight');
    res.json({ ok: true, stock: result.rows });
  } catch (error) {
    console.error('Stock fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.get('/api/stock/movements', async (req, res) => {
  try {
    const result = await query('SELECT * FROM stock_movements ORDER BY date DESC');
    res.json({ ok: true, movements: result.rows });
  } catch (error) {
    console.error('Stock movements fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ==============================
// REPORTS
// ==============================
app.get('/api/reports/day', async (req, res) => {
  const date = req.query.date;
  if (!date) {
    return res.status(400).json({ ok: false, message: 'Query param "date" (YYYY-MM-DD) is required' });
  }

  try {
    const salesResult = await query(`
      SELECT s.*, 
             json_agg(
               json_build_object(
                 'productName', si.product_name,
                 'quantity', si.quantity,
                 'weight', si.weight,
                 'pricePerKg', si.price_per_kg,
                 'lineTotal', si.line_total
               )
             ) as products
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE DATE(s.date) = $1
      GROUP BY s.id
      ORDER BY s.date DESC
    `, [date]);

    const daySales = salesResult.rows.map(row => ({
      ...row,
      products: row.products[0] ? row.products : []
    }));

    let totalSales = 0;
    let totalReceived = 0;
    const productMap = {};

    daySales.forEach(s => {
      totalSales += Number(s.grand_total || 0);
      totalReceived += Number(s.paid_now || 0);

      s.products.forEach(p => {
        const name = p.productName || 'Unknown';
        if (!productMap[name]) {
          productMap[name] = { productName: name, totalQty: 0, totalWeight: 0 };
        }
        productMap[name].totalQty += Number(p.quantity || 0);
        productMap[name].totalWeight += Number(p.weight || 0);
      });
    });

    const productsSummary = Object.values(productMap);

    res.json({
      ok: true,
      date,
      totalSales: +totalSales.toFixed(2),
      totalReceived: +totalReceived.toFixed(2),
      invoices: daySales,
      productsSummary
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.get('/api/reports/sales', async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, 
             json_agg(
               json_build_object(
                 'productName', si.product_name,
                 'quantity', si.quantity,
                 'weight', si.weight,
                 'pricePerKg', si.price_per_kg,
                 'lineTotal', si.line_total
               )
             ) as products
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      GROUP BY s.id
      ORDER BY s.date DESC
    `);
    
    const sales = result.rows.map(row => ({
      ...row,
      products: row.products[0] ? row.products : []
    }));
    
    res.json({ ok: true, sales });
  } catch (error) {
    console.error('Sales reports fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.get('/api/reports/pending-customers', async (req, res) => {
  try {
    const result = await query(`
      SELECT name as customer_name, previous_pending as total_pending
      FROM customers 
      WHERE previous_pending > 0 
      ORDER BY previous_pending DESC
    `);
    res.json({ ok: true, pending: result.rows });
  } catch (error) {
    console.error('Pending customers fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ==============================
// RECYCLE BIN
// ==============================
async function cleanRecycleBin() {
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - THIRTY_DAYS).toISOString();

  await query('DELETE FROM recycle_bin_sales WHERE deleted_at < $1', [cutoff]);
  await query('DELETE FROM recycle_bin_purchases WHERE deleted_at < $1', [cutoff]);
  await query('DELETE FROM recycle_bin_vendors WHERE deleted_at < $1', [cutoff]);
  await query('DELETE FROM recycle_bin_customers WHERE deleted_at < $1', [cutoff]);
}

app.get('/api/recycle-bin/:type', async (req, res) => {
  const { type } = req.params;

  try {
    await cleanRecycleBin();

    let tableName;
    switch (type) {
      case 'sales':
        tableName = 'recycle_bin_sales';
        break;
      case 'purchases':
        tableName = 'recycle_bin_purchases';
        break;
      case 'vendors':
        tableName = 'recycle_bin_vendors';
        break;
      case 'customers':
        tableName = 'recycle_bin_customers';
        break;
      default:
        return res.json({ ok: false, message: 'Invalid recycle-bin type' });
    }

    const result = await query(`SELECT * FROM ${tableName} ORDER BY deleted_at DESC`);
    res.json({ ok: true, items: result.rows });
  } catch (error) {
    console.error('Recycle bin fetch error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.post('/api/recycle-bin/restore', async (req, res) => {
  const { type, id } = req.body;

  try {
    let tableName, mainTable, idField;
    
    switch (type) {
      case 'sales':
        tableName = 'recycle_bin_sales';
        mainTable = 'sales';
        idField = 'id';
        break;
      case 'purchases':
        tableName = 'recycle_bin_purchases';
        mainTable = 'purchases';
        idField = 'id';
        break;
      case 'vendors':
        tableName = 'recycle_bin_vendors';
        mainTable = 'vendors';
        idField = 'id';
        break;
      case 'customers':
        tableName = 'recycle_bin_customers';
        mainTable = 'customers';
        idField = 'id';
        break;
      default:
        return res.json({ ok: false, message: 'Invalid type' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const itemResult = await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
      if (itemResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.json({ ok: false, message: 'Item not found in recycle bin' });
      }

      const item = itemResult.rows[0];
      const { deleted_at, ...restoredData } = item;

      const columns = Object.keys(restoredData).join(', ');
      const values = Object.keys(restoredData).map((_, i) => `$${i + 1}`).join(', ');
      const params = Object.values(restoredData);

      await client.query(`INSERT INTO ${mainTable} (${columns}) VALUES (${values})`, params);
      await client.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);

      await client.query('COMMIT');
      res.json({ ok: true, restored: restoredData });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.delete('/api/recycle-bin/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    let tableName;
    switch (type) {
      case 'sales':
        tableName = 'recycle_bin_sales';
        break;
      case 'purchases':
        tableName = 'recycle_bin_purchases';
        break;
      case 'vendors':
        tableName = 'recycle_bin_vendors';
        break;
      case 'customers':
        tableName = 'recycle_bin_customers';
        break;
      default:
        return res.json({ ok: false, message: 'Invalid recycle-bin type' });
    }

    const result = await query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    
    if (result.rowCount === 0) {
      return res.json({ ok: false, message: 'Item not found' });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Recycle bin delete error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.delete('/api/recycle-bin/:type', async (req, res) => {
  const { type } = req.params;

  try {
    let tableName;
    switch (type) {
      case 'sales':
        tableName = 'recycle_bin_sales';
        break;
      case 'purchases':
        tableName = 'recycle_bin_purchases';
        break;
      case 'vendors':
        tableName = 'recycle_bin_vendors';
        break;
      case 'customers':
        tableName = 'recycle_bin_customers';
        break;
      default:
        return res.json({ ok: false, message: 'Invalid recycle-bin type' });
    }

    await query(`DELETE FROM ${tableName}`);
    res.json({ ok: true });
  } catch (error) {
    console.error('Recycle bin clear error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

// ==============================
// DEVELOPMENT ENDPOINTS
// ==============================
app.post('/api/dev/reset-purchases', async (req, res) => {
  try {
    await query('DELETE FROM purchase_items');
    await query('DELETE FROM purchases');
    res.json({ ok: true, message: 'All purchases cleared' });
  } catch (error) {
    console.error('Reset purchases error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

app.post('/api/dev/reset-purchases-and-vendors', async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM purchase_items');
      await client.query('DELETE FROM purchases');
      await client.query('DELETE FROM vendor_transactions');
      await client.query('DELETE FROM vendors');
      await client.query('COMMIT');
      
      res.json({ ok: true, message: 'All purchases, vendors, and vendor transactions cleared' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ ok: false, message: 'Database error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('ERP backend with PostgreSQL running on port', PORT));