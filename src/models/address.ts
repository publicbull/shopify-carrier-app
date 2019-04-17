export const AddressSchema = {
    name: 'Address',
    properties: {
        barangay: { type: 'string', indexed: true },
        carrier: { type: 'Carrier', indexed: false },
        city: { type: 'string', indexed: true },
        province: { type: 'string', indexed: true },
        state: { type: 'string', indexed: true },
        zip: { type: 'string', indexed: true }
    }
}
