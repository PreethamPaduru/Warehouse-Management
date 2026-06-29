const EmployeeProfile = require('../Models/EmployeeProfile');
const Notification = require('../Models/Notification');
const UserModel = require('../Models/Schema');
const WarehouseItem = require('../Models/WarehouseItem');

const formatQrText = (item) => [
    'WAREHOUSE ITEM DETAILS',
    `Item Description: ${item.itemDescription}`,
    `Item Code: ${item.itemCode}`,
    `Batch / Lot No: ${item.batchNo}`,
    `Mfg Date: ${item.mfgDate}`,
    `Expiry Date: ${item.expiryDate}`,
    `Quantity: ${item.quantity}`,
    `Storage Location: ${item.storageLocation}`,
    `Supplier: ${item.supplier}`,
    `GTIN: ${item.gtin}`,
    `AI Batch: ${item.aiBatch}`,
    `AI Exp: ${item.aiExp}`,
    `Temp Storage: ${item.tempStorage}`,
    `Label / Package: ${item.labelType || 'Carton / Package Label'}`,
    `Created By: ${item.createdBy.name}`,
    `Creator Email: ${item.createdBy.email}`,
    `Created At: ${new Date(item.createdAt || Date.now()).toLocaleString()}`
].join('\n');

const getProfile = async (req, res) => {
    try {
        const profile = await EmployeeProfile.findOne({ userId: req.user._id });
        res.status(200).json({ success: true, profile });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to fetch employee profile' });
    }
};

const saveProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).select('name email');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const profile = await EmployeeProfile.findOneAndUpdate(
            { userId: req.user._id },
            {
                ...req.body,
                userId: req.user._id,
                name: user.name,
                email: user.email
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: 'Employee details saved', profile });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to save employee profile' });
    }
};

const getItems = async (req, res) => {
    try {
        const items = await WarehouseItem.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to fetch warehouse items' });
    }
};

const getPublicItem = async (req, res) => {
    try {
        const item = await WarehouseItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to fetch item details' });
    }
};

const getActor = async (userId) => {
    const user = await UserModel.findById(userId).select('name email');

    if (!user) {
        return null;
    }

    return {
        userId: user._id,
        name: user.name,
        email: user.email
    };
};

const getItemSnapshot = (item) => ({
    itemId: item._id,
    itemDescription: item.itemDescription,
    itemCode: item.itemCode,
    batchNo: item.batchNo
});

const createNotification = async ({ type, title, message, actor, owner, item }) => {
    await Notification.create({
        type,
        title,
        message,
        actor,
        owner,
        item: getItemSnapshot(item)
    });
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ clearedBy: { $ne: req.user._id } }).sort({ createdAt: -1 }).limit(30);
        const currentUserId = req.user._id.toString();
        const unreadCount = notifications.filter((notification) => !notification.readBy
            .some((userId) => userId.toString() === currentUserId)).length;

        res.status(200).json({ success: true, notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to fetch notifications' });
    }
};

const clearNotifications = async (req, res) => {
    try {
        await Notification.updateMany(
            { clearedBy: { $ne: req.user._id } },
            {
                $addToSet: {
                    clearedBy: req.user._id,
                    readBy: req.user._id
                }
            }
        );

        res.status(200).json({ success: true, message: 'Notifications cleared' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to clear notifications' });
    }
};

const markNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { readBy: { $ne: req.user._id } },
            { $addToSet: { readBy: req.user._id } }
        );

        res.status(200).json({ success: true, message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to update notifications' });
    }
};

const createItem = async (req, res) => {
    try {
        const actor = await getActor(req.user._id);

        if (!actor) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const itemData = {
            ...req.body,
            qrPayload: 'pending',
            createdBy: {
                userId: req.user._id,
                name: actor.name,
                email: actor.email
            }
        };

        const item = await WarehouseItem.create(itemData);
        item.qrPayload = formatQrText(item);
        await item.save();
        await createNotification({
            type: 'ITEM_CREATED',
            title: 'Item created',
            message: `${actor.name} created item ${item.itemDescription}.`,
            actor,
            owner: actor,
            item
        });
        await createNotification({
            type: 'QR_GENERATED',
            title: 'QR code generated',
            message: `${actor.name} created ${item.itemDescription} and generated its QR code.`,
            actor,
            owner: actor,
            item
        });

        res.status(201).json({ success: true, message: 'Item and QR saved', item });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to save item' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const actor = await getActor(req.user._id);

        if (!actor) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const item = await WarehouseItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const owner = item.createdBy;
        const deletedByOther = owner.userId.toString() !== req.user._id.toString();

        await createNotification({
            type: deletedByOther ? 'QR_DELETED_BY_OTHER' : 'QR_DELETED',
            title: deletedByOther ? 'QR deleted by another person' : 'QR code deleted',
            message: deletedByOther
                ? `${actor.name} deleted ${item.itemDescription}, which was generated by ${owner.name}.`
                : `${actor.name} deleted their QR code for ${item.itemDescription}.`,
            actor,
            owner,
            item
        });

        await item.deleteOne();

        res.status(200).json({ success: true, message: 'QR record deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to delete item' });
    }
};

module.exports = {
    getProfile,
    saveProfile,
    getItems,
    getPublicItem,
    getNotifications,
    markNotificationsRead,
    clearNotifications,
    createItem,
    deleteItem
};
