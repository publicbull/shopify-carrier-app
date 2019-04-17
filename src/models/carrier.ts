export const CarrierSchema = {
    name: 'Carrier',
    properties: {
        addresses: 'Address[]',
        name: 'string',
        priority: 'int',
        subtype: 'string?'
    }
}
