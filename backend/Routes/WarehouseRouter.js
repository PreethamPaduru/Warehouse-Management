const router = require('express').Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const {
    getProfile,
    saveProfile,
    getItems,
    getPublicItem,
    getNotifications,
    markNotificationsRead,
    clearNotifications,
    createItem,
    deleteItem
} = require('../Controllers/WarehouseController');

router.get('/profile', ensureAuthenticated, getProfile);
router.post('/profile', ensureAuthenticated, saveProfile);
router.get('/items', ensureAuthenticated, getItems);
router.post('/items', ensureAuthenticated, createItem);
router.delete('/items/:id', ensureAuthenticated, deleteItem);
router.get('/notifications', ensureAuthenticated, getNotifications);
router.patch('/notifications/read', ensureAuthenticated, markNotificationsRead);
router.delete('/notifications', ensureAuthenticated, clearNotifications);
router.get('/public/items/:id', getPublicItem);

module.exports = router;
