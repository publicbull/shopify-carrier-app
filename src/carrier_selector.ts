import csv from 'fast-csv'
import fs from 'fs'

import Realm from 'realm'

import { AddressSchema } from './models/address'
import { CarrierSchema } from './models/carrier'

export class CarrierSelector {
    get realm(): Promise<Realm> {
        return this._realm
    }
    private _realm: Promise<any>

    constructor(done?: any) {
        this._realm = Promise.resolve(
            new Realm({
                inMemory: true,
                schema: [CarrierSchema, AddressSchema]
            })
        )
        this.loadCSVData(done)
    }

    public carriers(): Promise<any[]> {
        return this._realm.then(realm => realm.objects('Carrier'))
    }

    public addresses(): Promise<any[]> {
        return this._realm.then(realm => realm.objects('Address'))
    }

    public lookupCarrier(address: any) {
        return this.realm.then(realm =>
            realm.objects('Address').filtered(address)
        )
    }

    protected loadCSVData(done: any) {
        const that = this
        this._realm.then(realm => {
            console.log('Realm opened')
            fs.readdir('./csv', (err, files) => {
                const promises = files.map(file => {
                    const csvStream = fs.createReadStream(`./csv/${file}`)
                    const [spriority, name, subtype] = file.split(/[_\.]/)
                    const priority: number = parseInt(spriority, 10)
                    let row = 0
                    const addresses: any[] = []
                    return new Promise(resolve =>
                        csv
                            .fromStream(csvStream)
                            .transform((data: string[]) => {
                                return {
                                    barangay: data[3],
                                    city: data[2],
                                    province: data[1],
                                    state: data[0],
                                    zip: data[4]
                                }
                            })
                            .on('data', (address: any) => {
                                if (row++ > 0) {
                                    addresses.push(address)
                                }
                            })
                            .on('end', resolve)
                    ).then(() =>
                        realm.write(() =>
                            realm.create('Carrier', {
                                addresses,
                                name,
                                priority,
                                subtype
                            })
                        )
                    )
                })
                Promise.all(promises).then(() => {
                    console.log(`Finished records loaded`)
                    if (done) {
                        done(that)
                    }
                })
            })
        })
    }
}
