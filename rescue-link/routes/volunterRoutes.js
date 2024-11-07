const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunterController');

router.post('/volunteers/register', volunteerController.registerVolunteer);
router.get('/volunteers/:volunteer_id', volunteerController.getVolunteerById);
router.get('/volunteers', volunteerController.getAllVolunteers);
router.delete('/volunteers/delete/:volunteer_id', volunteerController.unregisterVolunteer);
router.delete('/volunteers/unregister', volunteerController.unregisterAllVolunteers);

module.exports = router;
