import { expect, should } from 'chai'
import Realm from 'realm'
import { AddressSchema } from './models/address'
import { CarrierSchema } from './models/carrier'

should()

describe('Realm', () => {
    let realm

    beforeAll(async () => {
        realm = await Realm.open({
            schema: [CarrierSchema, AddressSchema]
        })
        return realm
    })

    afterAll(async () => {
        console.log('Closing database')
        realm.close().then(() => process.exit())
    })

    it('open', async () => {
        realm.objects('Carrier').length.should.equal(0)
    })
})
