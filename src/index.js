import axios from "axios";
import _ from "lodash";

const defaultTransformResponse = (response) => response.data;

const defaultOnError = () => null;
const defaultOnBefore = () => null;

/* eslint-disable no-underscore-dangle */

export default class Requester {
  constructor(params = {}) {
    const {
      transformRequestData,
      transformResponse,
      injectHeaders,
      onBefore,
      onError,
      ...config
    } = params;

    this.onError = onError || defaultOnError;
    this.onBefore = onBefore || defaultOnBefore;

    this._root = axios.create(config);

    this._injectHeaders = injectHeaders || _.identity;
    this._transformRequestData = transformRequestData || _.identity;
    this._transformResponse = transformResponse || defaultTransformResponse;
  }

  post(url, payload) {
    return this._request("post", url, { data: this._data(payload) });
  }

  patch(url, payload) {
    return this._request("patch", url, { data: this._data(payload) });
  }

  get(url, payload) {
    return this._request("get", url, { params: payload });
  }

  delete(url, payload) {
    return this._request("delete", url, { data: this._data(payload) });
  }

  _request(method, url, data) {
    this.onBefore(method, url, data);

    return this._root
      .request({
        method,
        url,
        ...data,
        headers: this._injectHeaders(),
      })
      .then((response) => {
        let successObject;

        try {
          successObject = this._transformResponse(response);
        } catch (e) {
          successObject = defaultTransformResponse(response);
        }

        return successObject;
      })
      .catch(({ response }) => {
        try {
          this.onError(response);
        } catch (error) {
          // We output Error in order not to silently bypass it
          // eslint-disable-next-line no-console
          console.error(error);
        }

        const errorObject = response.data;

        return Promise.reject(errorObject);
      });
  }

  _data(payload) {
    return this._transformRequestData(payload);
  }
}
