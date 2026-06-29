const mongoose = require('mongoose');

const warehouseItemSchema = new mongoose.Schema({
    itemDescription: { type: String, required: true },
    itemCode: { type: String, required: true },
    batchNo: { type: String, required: true },
    mfgDate: { type: String, required: true },
    expiryDate: { type: String, required: true },
    quantity: { type: String, required: true },
    storageLocation: { type: String, required: true },
    supplier: { type: String, required: true },
    gtin: { type: String, required: true },
    aiBatch: { type: String, required: true },
    aiExp: { type: String, required: true },
    tempStorage: { type: String, required: true },
    qrPayload: { type: String, required: true },
    labelType: { type: String, default: 'Carton / Package Label' },
    createdBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('WarehouseItem', warehouseItemSchema);
