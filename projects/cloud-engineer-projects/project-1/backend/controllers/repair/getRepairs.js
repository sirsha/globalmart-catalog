const db = require("../../config/db");

const getRepairs = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM repairs ORDER BY created_at DESC");
    
    // Transform database rows to match frontend expectations
    const formattedRepairs = rows.map(row => ({
      id: row.id.toString(),
      title: row.title || row.description, // fallback for existing data
      customerName: row.customerName || row.assigned_to, // fallback
      repairType: row.repairType || "General Maintenance",
      priority: row.priority,
      status: row.status,
      dateAdded: row.dateAdded || new Date(row.created_at).toLocaleDateString(),
      estimatedCost: row.estimatedCost
    }));

    res.json(formattedRepairs);
  } catch (error) {
    console.error("Error fetching repairs:", error);
    res.status(500).json({ error: "Failed to fetch repairs" });
  }
};

module.exports = getRepairs;