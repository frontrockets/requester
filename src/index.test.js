import axios from 'axios'

import Requester from './'

const mockAxiosInstance = {
  request: jest.fn(() => null),
}

beforeEach(() => {
  axios.create = jest.fn(() => mockAxiosInstance)
  mockAxiosInstance.request.mockReset()
})

it('passes the config to axios', () => {
  const config = { test: '$$test' }

  new Requester(config)

  expect(axios.create).toHaveBeenCalledWith(expect.objectContaining(config))
})

describe('where methods', () => {
  const url = '$URL'
  const payload = { one: 'first', two: 'second' }

  beforeEach(() => {
    mockAxiosInstance.request.mockResolvedValue({})
  })

  const methods = ['post', 'patch', 'delete']

  methods.forEach((method) => {
    describe(method.toUpperCase(), () => {
      it(`sends ${method.toUpperCase()} request to correct URL`, () => {
        const instance = new Requester()
        instance[method](url, payload)

        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method,
            url,
          }),
        )
      })

      it('sends payload as data', () => {
        const instance = new Requester()
        instance[method](url, payload)

        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            data: payload,
          }),
        )
      })

      it('sends transformed payload as data (via `transformRequestData`)', () => {
        const transformRequestData = (data) => ({
          wrapper: data,
          another: true,
        })

        const instance = new Requester({ transformRequestData })
        instance[method](url, payload)

        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            data: transformRequestData(payload),
          }),
        )
      })
    })
  })

  describe('GET', () => {
    it('sends GET request to correct URL', () => {
      const instance = new Requester()
      instance.get(url, payload)

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url,
        }),
      )
    })

    it('sends payload as params', () => {
      const instance = new Requester()
      instance.get(url, payload)

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: payload,
        }),
      )
    })
  })
})

it('injects headers at the moment of making a request (via `injectHeaders`)', () => {
  const injectHeaders = jest.fn()
  const instance = new Requester({ injectHeaders })
  mockAxiosInstance.request.mockResolvedValue({})

  expect(injectHeaders).not.toHaveBeenCalled()
  instance.get()
  expect(injectHeaders).toHaveBeenCalled()
})

describe('when request succeeded', () => {
  const requestResult = {
    data: {
      one: 1,
    },
  }

  beforeEach(() => {
    mockAxiosInstance.request.mockResolvedValue(requestResult)
  })

  it('returns data by default', async () => {
    const instance = new Requester()

    await expect(instance.get()).resolves.toEqual(requestResult.data)
  })

  it('returns transformed data (via `transformResponse`)', async () => {
    const transformResponse = (response) => response.data.one
    const instance = new Requester({ transformResponse })

    await expect(instance.get()).resolves.toEqual(
      transformResponse(requestResult),
    )
  })

  it('returns data when custom transformResponse failed', async () => {
    const transformResponse = () => {
      throw new Error('Exception from transformResponse')
    }
    const instance = new Requester({ transformResponse })

    await expect(instance.get()).resolves.toEqual(requestResult.data)
  })
})

describe('when request failed', () => {
  const requestResult = {
    data: {
      one: 1,
    },
  }

  beforeEach(() => {
    mockAxiosInstance.request.mockRejectedValue({ response: requestResult })
  })

  it('returns data by default', async () => {
    const instance = new Requester()

    await expect(instance.get()).rejects.toEqual(requestResult.data)
  })
})
