import { expect, should } from 'chai'
import * as request from 'request-promise'

import { CarrierSelector } from './carrier_selector'

import { serverStarted } from './index'

should()

describe('CarrierSelector', () => {
    afterAll(done =>
        CarrierSelector.getInstance()
            .realm.then(realm => {
                realm.write(() => realm.deleteAll())
                return realm
            })
            .then(realm => realm.close())
            .then(done)
    )

    it('user GET should be 200 (json)', done => {
        jest.setTimeout(10000)
        serverStarted.then(() =>
            request
                .get({
                    uri: 'http://localhost:3000/',
                    qs: {
                        city: 'Makati'
                    },
                    json: true
                })
                .then(value => {
                    expect(value).to.deep.equal(['AIC', 'BAE', 'LBC'])
                })
                .then(done)
        )
    })
    it('user GET should be 200 (text/plain)', done => {
        jest.setTimeout(10000)
        serverStarted.then(() =>
            request
                .get({
                    uri: 'http://localhost:3000/',
                    qs: {
                        city: 'Makati'
                    },
                    json: false
                })
                .then(value => {
                    expect(value).to.equal('AIC\r\n')
                })
                .then(done)
        )
    })
    it('user GET for unknown ZIP should return 200 (text/plain)', done => {
        jest.setTimeout(10000)
        serverStarted.then(() =>
            request
                .get({
                    uri: 'http://localhost:3000/',
                    qs: {
                        city: 'MakatiXXX'
                    },
                    json: false
                })
                .then(value => {
                    expect(value).to.equal('LBC\r\n')
                })
                .then(done)
        )
    })
})
