const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        default: 'Unknown'
    },
    email: {
        type: String,
        default: ''
    }
}, { _id: false });

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['ITEM_CREATED', 'QR_GENERATED', 'QR_DELETED', 'QR_DELETED_BY_OTHER'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    actor: personSchema,
    owner: personSchema,
    item: {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WarehouseItem'
        },
        itemDescription: String,
        itemCode: String,
        batchNo: String
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    clearedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
