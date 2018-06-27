let expect = require("chai").expect;
let Cligen = require('../index');


describe("Client", function () {

    it('should have a property corresponding to the operation', function () {
        let client = Cligen.getClient({
            "baseUrl": "https://test.com",
            "operations": {
                "rates": {},
                "deals": {}
            }
        });
        expect(client).to.have.property('rates');
        expect(client).to.have.property('deals');
    });
});

describe("Operation", function () {

    let client = Cligen.getClient({
        "baseUrl": "http://test.com",
        "operations": {
            "rates": {
                "uri": "/rates"
            },
            "deals": {
                "uri": "/deals/{id}",
                "method": "post",
            }
        }
    }, { mock: true });

    let exchange = Cligen.getClient(require('./exchangeratesapi.io.json'), { mock: true });

    it('should set request url', function () {

        return client.rates()
            .then(response => {
                expect(response.request.url).to.equal('http://test.com/rates');
            });
    });

    it('should set request method as "get" when not provided', function () {

        return exchange.rates()
            .then(response => {
                expect(response.request.method).to.equal('GET');
            });
    });

    it('should set request method', function () {

        return client.deals()
            .then(response => {
                expect(response.request.method).to.equal('POST');
            });
    });

    it('should translate path parameter', () => {

        return exchange.rates({
            date: "2018-01-01"
        }).then(response => {
            expect(response.request.url).to.equal('https://exchangeratesapi.io/api/2018-01-01');
        });
    });

    it('should translate query parameter', () => {

        return exchange.rates({
            base: "USD",
            symbols: "EUR"
        }).then(response => {
            let parts = response.request.url.split('?');

            if (parts && parts[1]) {
                let parameters = require('query-string').parse(parts[1]);

                expect(parameters).to.have.property('base');
                expect(parameters.base).to.equal('USD');

                expect(parameters).to.have.property('symbols');
                expect(parameters.symbols).to.equal('EUR');
            }


        });
    });

    it('should translate parameter with default value', () => {

        return exchange.rates().then(response => {
            expect(response.request.url).to.equal('https://exchangeratesapi.io/api/latest');
        });
    });

    //it('should not translate parameter that is not configured', () => { });
});