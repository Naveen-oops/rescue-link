const express = require('express');
const router = express.Router();
const { listResources, addResource, updateResource, getResourceById } = require('../controllers/resourceController');

router.get('/resources', listResources);
router.post('/resources', addResource);
router.patch('/resources/:resource_id', updateResource);
router.get('/resources/:resource_id', getResourceById);

module.exports = router;
