import axios, { AxiosRequestConfig, Canceler } from 'axios';

const cancelMap = new Map<String, Canceler>();

export function getRequestlKey(config: AxiosRequestConfig): string {
  const { url, method, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
}

export class AxiosCancel {
  private static instance?: AxiosCancel;

  static createInstance() {
    return this.instance ?? (this.instance = new AxiosCancel());
  }

  add(config: AxiosRequestConfig) {
    const requestKey = getRequestlKey(config);
    this.remove(requestKey);
    config.cancelToken = new axios.CancelToken((cancel) => {
      !cancelMap.has(requestKey) && cancelMap.set(requestKey, cancel);
    });
  }

  remove(requestKey: string) {
    if (cancelMap.has(requestKey)) {
      const cancel = cancelMap.get(requestKey);
      cancel && cancel(requestKey);
      cancelMap.delete(requestKey);
    }
  }
}

const axiosCancel = AxiosCancel.createInstance();

export default axiosCancel;
