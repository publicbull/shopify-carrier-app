import * as dotenv from 'dotenv-flow'
dotenv.config()

import express from 'express'
const app = express()

import cookie from 'cookie'
import crypto from 'crypto'
import querystring from 'querystring'
import request from 'request-promise'

const nonce = require('nonce')()

import * as _ from 'lodash'
import { CarrierSelector } from './carrier_selector'

const apiKey = process.env.SHOPIFY_API_KEY
const apiSecret = process.env.SHOPIFY_API_SECRET
const scopes = 'read_products'
const forwardingAddress = process.env.FORWARDING_ADDRESS // Replace this with your HTTPS Forwarding address

let carrierSelector
const dbLoaded = new Promise(
    resolve => (carrierSelector = new CarrierSelector(resolve))
)

app.get('/', (req, res) => {
    if (Object.keys(req.query).length > 0) {
        const qa: string[] = Object.keys(req.query).map(key => {
            let it = req.query[key].toString().toLowerCase()
            switch (key) {
                case 'barangay':
                case 'province':
                case 'state':
                case 'city':
                    it = `*${it}*`
                    break
            }
            return `${key} LIKE "${it}"`
        })
        const q: string = qa.join(' AND ')
        console.debug(q)

        carrierSelector
            .lookupCarrier(q)
            .then((arr: any) => {
                const carriers = arr.map(it => it.carrier)
                const names: string[] = _.uniq(
                    carriers.map(it => it.snapshot()[0].name)
                )
                res.status(200).json(names)
            })
            .catch(err => res.status(400).send(err.message))
    } else {
        res.status(400).send('Shopify carrier selector application API')
    }
})

app.get('/shopify', (req, res) => {
    const shop = req.query.shop
    if (shop) {
        const state = nonce()
        const redirectUri = forwardingAddress + '/shopify/callback'
        const installUrl =
            'https://' +
            shop +
            '/admin/oauth/authorize?client_id=' +
            apiKey +
            '&scope=' +
            scopes +
            '&state=' +
            state +
            '&redirect_uri=' +
            redirectUri

        res.cookie('state', state)
        return res.redirect(installUrl)
    } else {
        return res
            .status(400)
            .send(
                'Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request'
            )
    }
})

app.get('/shopify/callback', (req, res) => {
    const { shop, hmac, code, state } = req.query
    const stateCookie = cookie.parse(req.headers.cookie || '').state

    if (state !== stateCookie) {
        return res.status(403).send('Request origin cannot be verified')
    }

    if (shop && hmac && code) {
        // DONE: Validate request is from Shopify
        const map = Object.assign({}, req.query)
        delete map.signature
        delete map.hmac
        const message = querystring.stringify(map)
        const providedHmac = Buffer.from(hmac, 'utf-8')
        const generatedHash = Buffer.from(
            crypto
                .createHmac('sha256', apiSecret || '')
                .update(message)
                .digest('hex'),
            'utf-8'
        )
        let hashEquals = false

        try {
            hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
        } catch (e) {
            hashEquals = false
        }

        if (!hashEquals) {
            return res.status(400).send('HMAC validation failed')
        }

        // DONE: Exchange temporary code for a permanent access token
        const accessTokenRequestUrl =
            'https://' + shop + '/admin/oauth/access_token'
        const accessTokenPayload = {
            client_id: apiKey,
            client_secret: apiSecret,
            code
        }

        return request
            .post(accessTokenRequestUrl, { json: accessTokenPayload })
            .then(accessTokenResponse => {
                const accessToken = accessTokenResponse.access_token
                // DONE: Use access token to make API call to 'shop' endpoint
                const shopRequestUrl =
                    'https://' + shop + '/admin/api/2019-04/shop.json'
                const shopRequestHeaders = {
                    'X-Shopify-Access-Token': accessToken
                }

                request
                    .get(shopRequestUrl, { headers: shopRequestHeaders })
                    .then(shopResponse => {
                        res.status(200).end(shopResponse)
                    })
                    .catch(error => {
                        res.status(error.statusCode).send(
                            error.error.error_description
                        )
                    })
            })
            .catch(error => {
                return res
                    .status(error.statusCode)
                    .send(error.error.error_description)
            })
    } else {
        return res.status(400).send('Required parameters missing')
    }
})

export const serverStarted = new Promise(resolve => {
    app.listen(3000, () => {
        console.log('Example app listening on port 3000!')
        dbLoaded.then(() => resolve(app))
    })
})
