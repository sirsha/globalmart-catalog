// controllers/repair/deleteRepair.js
const db = require('../../config/db');

const deleteRepair = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Invalid or missing repair ID' 
      });
    }

    const repairId = parseInt(id);

    // Check if repair exists before deleting
    const checkQuery = 'SELECT id FROM repairs WHERE id = ?';
    const [existingRepair] = await db.execute(checkQuery, [repairId]);

    if (existingRepair.length === 0) {
      return res.status(404).json({ 
        error: 'Repair not found' 
      });
    }

    // Delete the repair
    const deleteQuery = 'DELETE FROM repairs WHERE id = ?';
    await db.execute(deleteQuery, [repairId]);

    res.status(200).json({ 
      message: 'Repair deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting repair:', error);
    res.status(500).json({ error: 'Failed to delete repair' });
  }
};

module.exports = deleteRepair;