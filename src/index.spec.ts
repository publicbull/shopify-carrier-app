import { expect, should } from 'chai'
import * as request from 'request-promise'

import { CarrierSelector } from './carrier_selector'

import { serverStarted } from './index'

should()

describe('CarrierSelector', () => {
    it('user GET should be 200', async () => {
        await serverStarted
        return request
            .get({
                uri: 'http://localhost:3000/',
                qs: {
                    city: 'Makati'
                },
                json: true
            })
            .then(value => {
                console.log(value)
            })
    })
})
