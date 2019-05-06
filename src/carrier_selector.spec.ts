import { expect, should } from 'chai'

import { CarrierSelector } from './carrier_selector'

should()

describe('CarrierSelector', () => {
    let cs: CarrierSelector
    beforeAll(done => (cs = new CarrierSelector(() => done())))
    afterAll(done => cs.realm.then(realm => realm.close()))
    it('constructor', done => {
        cs.carriers()
            .then(carriers => {
                expect(carriers.length).to.equal(6)
                console.log(carriers)
            })
            .then(() => cs.addresses())
            .then(addresses => expect(addresses.length).to.equal(23000))
            .then(() => done())
    })

    it('lookupCarrier', () => {
        let now
        console.log('start lookup', (now = Date.now()))
        return cs
            .lookupCarrier('zip LIKE "2209" AND barangay LIKE "*vaca"') // should be in lowerCase
            .then(it => expect(it.length).equal(2))
            .then(it => console.log('End lookup ' + (Date.now() - now)))
            .then(() => console.log('Start 2nd lookup ' + (now = Date.now())))
            .then(() => cs.lookupCarrier('zip LIKE "2209"'))
            .then(it => expect(it.length).equal(30))
            .then(it => console.log('End lookup ' + (Date.now() - now)))
    })
})
