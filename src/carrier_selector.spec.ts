import { assert, should } from 'chai'

import { Carrier, CarrierSelector } from './carrier_selector'

should()

describe('Carrier', () => {
    it('constructor', () => {
        const c = new Carrier('one')
        c.name.should.equal('one')
    })

    it('getter/setter', () => {
        const c = new Carrier('one')
        c.name.should.equal('one')
        c.name = 'two'
        c.name.should.equal('two')
        assert(c.name === 'two')
    })
})

describe('CarrierSelector', () => {
    it('constructor', done => {
        const cs = new CarrierSelector(() => {
            cs.carriers.should.deep.equal([])
            cs.addresses.length.should.equal(23000)
            done()
        })
    })
})
