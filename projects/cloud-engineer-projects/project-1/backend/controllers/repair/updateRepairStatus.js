const db = require("../../config/db");

const updateRepairStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const [result] = await db.execute(
      `UPDATE repairs SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Repair not found" });
    }

    // Fetch and return the updated record
    const [rows] = await db.execute("SELECT * FROM repairs WHERE id = ?", [id]);
    const updatedRepair = {
      id: rows[0].id.toString(),
      title: rows[0].title,
      customerName: rows[0].customerName,
      repairType: rows[0].repairType,
      priority: rows[0].priority,
      status: rows[0].status,
      dateAdded: rows[0].dateAdded,
      estimatedCost: rows[0].estimatedCost
    };

    res.json(updatedRepair);
  } catch (error) {
    console.error("Error updating repair status:", error);
    res.status(500).json({ error: "Failed to update repair status" });
  }
};

module.exports = updateRepairStatus;