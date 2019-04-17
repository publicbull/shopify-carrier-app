import { expect, should } from 'chai'

import { CarrierSelector } from './carrier_selector'

should()

describe('CarrierSelector', () => {
    it('constructor', done => {
        const cs = new CarrierSelector(that =>
            that
                .carriers()
                .then(carriers => expect(carriers.length).to.equal(6))
                .then(() => that.addresses())
                .then(addresses => expect(addresses.length).to.equal(23000))
                .then(() => cs.realm)
                .then(realm => realm.close())
                .then(() => done())
        )
    })
})
