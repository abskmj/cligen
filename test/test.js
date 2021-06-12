const expect = require('chai').expect
const Cligen = require('../index')
const client = Cligen.getClient(require('./specs.json'), { mock: true })

describe('Client', function () {
  it('should have a property corresponding to the operation', function () {
    expect(client).to.have.property('fetch')
    // expect(client).to.have.property('deals');
  })
})

describe('Operation', function () {
  it('should set request url', function () {
    return client.fetch()
      .then(response => {
        expect(response.request.url).to.equal('http://dummy.server.com/test/fetch')
      })
  })

  it('should set request method as "get" when not provided', () => {
    return client.fetch()
      .then(response => {
        expect(response.request.method).to.equal('GET')
      })
  })

  it('should set request method', () => {
    return client.add()
      .then(response => {
        expect(response.request.method).to.equal('POST')
      })
  })

  it('should translate header parameter', () => {
    return client.add({
      'X-Request-Id': 'req89877'
    }).then(response => {
      expect(response.request.headers).to.have.property('X-Request-Id')
      expect(response.request.headers['X-Request-Id']).to.equal('req89877')
    })
  })

  it('should translate path parameter', () => {
    return client.add({
      id: '101'
    }).then(response => {
      expect(response.request.url).to.equal('http://dummy.server.com/test/101')
    })
  })

  it('should translate query parameter', () => {
    return client.add({
      count: '12',
      include: 'all'
    }).then(response => {
      const parts = response.request.url.split('?')

      if (parts && parts[1]) {
        const parameters = require('query-string').parse(parts[1])

        expect(parameters).to.have.property('count')
        expect(parameters.base).to.equal('12')

        expect(parameters).to.have.property('include')
        expect(parameters.symbols).to.equal('all')
      }
    })
  })

  it('should translate parameter with default value', () => {
    return client.add().then(response => {
      expect(response.request.url).to.equal('http://dummy.server.com/test/101')
    })
  })

  // it('should not translate parameter that is not configured', () => { });
})
