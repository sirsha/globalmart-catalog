const express = require('express');
const router = express.Router();

const addRepair = require('../../controllers/repair/addRepair');
const getRepairs = require('../../controllers/repair/getRepairs');
const updateRepairStatus = require('../../controllers/repair/updateRepairStatus');
const deleteRepair = require('../../controllers/repair/deleteRepair');

// Routes
router.get('/', getRepairs);
router.post('/', addRepair);
router.put('/:id', updateRepairStatus);
router.patch('/:id', updateRepairStatus);  // Add this line for PATCH support
router.delete('/:id', deleteRepair);

module.exports = router;