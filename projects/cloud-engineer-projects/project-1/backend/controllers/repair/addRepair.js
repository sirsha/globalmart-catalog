// controllers/repair/addRepair.js
const db = require('../../config/db');

const addRepair = async (req, res) => {
  try {
    const { 
      title, 
      customerName, 
      repairType, 
      priority, 
      status, 
      estimatedCost, 
      dateAdded,
      description // Add description field
    } = req.body;

    // Validate and sanitize estimatedCost
    const sanitizedCost = estimatedCost && estimatedCost !== '' 
      ? parseFloat(estimatedCost) 
      : null;

    // Validate required fields
    if (!title || !customerName || !repairType) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, customerName, repairType' 
      });
    }

    const query = `
      INSERT INTO repairs (
        title, 
        customerName, 
        repairType, 
        priority, 
        status, 
        estimatedCost, 
        dateAdded, 
        description,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      title,
      customerName,
      repairType,
      priority || 'Medium',
      status || 'Pending',
      sanitizedCost,
      dateAdded || new Date().toISOString().split('T')[0],
      description || null // Allow null for description
    ];

    const result = await db.execute(query, values);
    
    res.status(201).json({ 
      message: 'Repair added successfully', 
      repairId: result.insertId 
    });

  } catch (error) {
    console.error('Error adding repair:', error);
    res.status(500).json({ error: 'Failed to add repair' });
  }
};

module.exports = addRepair;