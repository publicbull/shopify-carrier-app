import csv from 'fast-csv'
import fs from 'fs'

class Address {
    private _state: string
    private _province: string
    private _city: string
    private _bangary: string
    private _zip: string

    constructor(
        state: string,
        province: string,
        city: string,
        bangary: string,
        zip: string
    ) {
        this._state = state
        this._province = province
        this._city = city
        this._bangary = bangary
        this._zip = zip
    }

    get state() {
        return this._state
    }
    get province() {
        return this._province
    }
    get zip() {
        return this._zip
    }
    get city() {
        return this._city
    }
    get bangary() {
        return this._bangary
    }
}

export class Carrier {
    private _name: string

    constructor(name: string) {
        this._name = name
    }
    get name() {
        return this._name
    }
    set name(a: string) {
        this._name = a
    }
}
export class CarrierSelector {
    private _carriers: Carrier[]
    private _addresses: Address[] = []

    constructor(done?: any) {
        this._carriers = []
        this._addresses = []
        this.loadCSVData(done)
    }

    protected loadCSVData(done: any) {
        fs.readdir('./csv', (err, files) => {
            const promises = files.map(file => {
                const csvStream = fs.createReadStream(`./csv/${file}`)
                let row = 0
                return new Promise(resolve =>
                    csv
                        .fromStream(csvStream)
                        .transform((data: string[]) => {
                            if (row++ > 0) {
                                return new Address(
                                    data[0],
                                    data[1],
                                    data[2],
                                    data[3],
                                    data[4]
                                )
                            } else {
                                return undefined
                            }
                        })
                        .on('data', address =>
                            address ? this._addresses.push(address) : undefined
                        )
                        .on('end', resolve)
                )
            })

            Promise.all(promises).then(() => {
                console.log(`Finished ${this._addresses.length} records loaded`)
                done()
            })
        })
    }

    get addresses() {
        return this._addresses
    }
    get carriers() {
        return this._carriers
    }
}
