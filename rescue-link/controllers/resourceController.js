const Resource = require('../models/resource');
const logger = require('../utils/logger');

const listResources = async (req, res) => {
    try {
        const { category, availability } = req.query;
        const filters = {};
        if (category) filters.super_category = category;
        if (availability) filters.availability = availability === 'true';

        logger.info(`Fetching resources with filters: ${JSON.stringify(filters)}`);
        const resources = await Resource.find(filters);
        
        logger.info(`Resources retrieved: ${resources.length} found`);
        res.json(resources);
    } catch (error) {
        logger.error(`List resources error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addResource = async (req, res) => {
    try {
        const resource = new Resource(req.body);
        await resource.save();

        logger.info(`Resource added: ${resource.resource_id}`);
        res.status(201).json({ resource_id: resource.resource_id });
    } catch (error) {
        logger.error(`Add resource error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateResource = async (req, res) => {
    try {
        const { resource_id } = req.params;
        const updatedResource = await Resource.findOneAndUpdate(
            { resource_id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedResource) {
            logger.warn(`Update resource error: Resource not found for ID ${resource_id}`);
            return res.status(404).json({ message: 'Resource not found' });
        }

        logger.info(`Resource updated successfully: ${resource_id}`);
        res.json({ status: 'Resource updated successfully' });
    } catch (error) {
        logger.error(`Update resource error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getResourceById = async (req, res) => {
    try {
        const { resource_id } = req.params;
        const resource = await Resource.findOne({ resource_id });

        if (!resource) {
            logger.warn(`Get resource error: Resource not found for ID ${resource_id}`);
            return res.status(404).json({ message: 'Resource not found' });
        }

        logger.info(`Resource retrieved: ${resource_id}`);
        res.json(resource);
    } catch (error) {
        logger.error(`Get resource error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    listResources,
    addResource,
    updateResource,
    getResourceById
};
