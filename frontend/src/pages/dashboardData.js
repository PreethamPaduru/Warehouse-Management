export const API_URL = (import.meta.env.VITE_API_URL || 'https://eugia-backend.vercel.app').replace(/\/+$/, '')

export const employeeFields = [
  { key: 'employeeId', label: 'Employee ID', placeholder: 'EMP-001' },
  { key: 'department', label: 'Department', placeholder: 'Warehouse Operations' },
  { key: 'designation', label: 'Designation', placeholder: 'Inventory Executive' },
  { key: 'phone', label: 'Phone', placeholder: 'Enter phone number' },
  { key: 'location', label: 'Location', placeholder: 'Warehouse A' }
]

export const detailFields = [
  { key: 'itemDescription', label: 'Item Description:', placeholder: 'Enter item description' },
  { key: 'itemCode', label: 'Item Code:', placeholder: 'Enter item code' },
  { key: 'batchNo', label: 'Batch / Lot No:', placeholder: 'Enter batch or lot number' },
  { key: 'mfgDate', label: 'Mfg Date:', placeholder: 'Enter manufacturing date' },
  { key: 'expiryDate', label: 'Expiry Date:', placeholder: 'Enter expiry date' },
  { key: 'quantity', label: 'Quantity:', placeholder: 'Enter quantity' },
  { key: 'storageLocation', label: 'Storage Location:', placeholder: 'Enter storage location' },
  { key: 'supplier', label: 'Supplier:', placeholder: 'Enter supplier' },
  { key: 'gtin', label: 'GTIN:', placeholder: 'Enter GTIN' },
  { key: 'aiBatch', label: 'AI Batch:', placeholder: 'Enter AI batch' },
  { key: 'aiExp', label: 'AI Exp:', placeholder: 'Enter AI expiry' },
  { key: 'tempStorage', label: 'Temp Storage:', placeholder: 'Enter temperature storage' }
]

export const emptyObject = (fields) => fields.reduce((values, field) => {
  values[field.key] = ''
  return values
}, {})

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: localStorage.getItem('token') || ''
})

export const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return 'Not available'
  }

  return new Date(dateValue).toLocaleString()
}

export const formatQrText = (item) => [
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
  `Created By: ${item.createdBy?.name || 'Unknown'}`,
  `Creator Email: ${item.createdBy?.email || 'Not available'}`,
  `Created At: ${formatDateTime(item.createdAt)}`
].join('\n')
