import { expect, should } from 'chai'

import { CarrierSelector } from './carrier_selector'

should()

describe('CarrierSelector', () => {
    let cs: CarrierSelector
    beforeAll(done => (cs = new CarrierSelector(() => done())))
    afterAll(done => cs.realm.then(realm => realm.close()))
    it('constructor', done => {
        cs.carriers()
            .then(carriers => expect(carriers.length).to.equal(6))
            .then(() => cs.addresses())
            .then(addresses => expect(addresses.length).to.equal(23000))
            .then(() => done())
    })

    it('lookupCarrier', () =>
        cs
            .lookupCarrier('zip LIKE "2209" AND barangay LIKE "*Vaca"')
            .then(it => expect(it.length).equal(2))
            .then(() => cs.lookupCarrier('zip LIKE "2209"'))
            .then(it => expect(it.length).equal(30)))
})
