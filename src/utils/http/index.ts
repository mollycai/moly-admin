import { AxiosHooks } from '#/axios';
import { TOKEN_KEY } from '@/enums/cacheEnums';
import NProgress from 'nprogress';
import { localCache } from '../cache';
import { ContentTypeEnum, RequestEnum } from '@/enums/httpEnums';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { checkStatus } from './status';
import { MAxios } from './axios';
import { merge } from 'lodash';
import configs from '@/config';

const axiosHooks: AxiosHooks = {
  /**
   * @description: 请求拦截器处理
   */
  requestInterceptorsHook(config) {
    NProgress.start();
    const { withToken, isParamsToData } = config.requestOptions;
    const params = config.params;
    const headers = config.headers || {};
    // 添加token
    if (withToken) {
      const token = localCache.get(TOKEN_KEY);
      headers.token = token;
    }
    // POST请求下若无data，则将params当做data
    if (isParamsToData && !Reflect.has(config, 'data') && config.method?.toUpperCase() === RequestEnum.POST) {
      config.data = params;
      config.params = {};
    }
    config.headers = headers;
    return config;
  },
  /**
   * @description: 请求拦截器错误处理
   */
  requestInterceptorsCatchHook(err) {
    NProgress.done();
    return err;
  },
  /**
   * @description: 响应拦截器处理
   */
  responseInterceptorsHook(response) {
    NProgress.done();
    const { isTransformResponse, isReturnDefaultResponse } = response.config.requestOptions;
    // 返回默认响应的情况
    if (isReturnDefaultResponse) {
      return response;
    }
    // 返回需要对数据进行处理的响应的情况
    if (!isTransformResponse) {
      return response.data;
    }
    // 此处还可以再根据后端返回的数据格式（code），进行判断和处理
    return response;
  },
  /**
   * @description: 请求拦截器错误处理
   */
  responseInterceptorsCatchHook(error) {
    NProgress.done();
    if (error.code !== AxiosError.ERR_CANCELED) {
      checkStatus(error?.response?.status as number, error?.message ?? '');
    }
    return Promise.reject(error);
  },
};

const defaultOptions: AxiosRequestConfig = {
  //接口超时时间
  timeout: configs.timeout,
  // 基础接口地址
  baseURL: configs.baseUrl,
  //请求头
  headers: { 'Content-Type': ContentTypeEnum.JSON, version: configs.version },
  // 处理 axios的钩子函数
  axiosHooks: axiosHooks,
  // 每个接口可以单独配置
  requestOptions: {
    isParamsToData: true,
    isReturnDefaultResponse: false,
    isTransformResponse: true,
    urlPrefix: configs.urlPrefix,
    ignoreCancelToken: false,
    withToken: true,
    isOpenRetry: true,
    retryCount: 0,
  },
};

function createAxios(opt?: Partial<AxiosRequestConfig>) {
  return new MAxios(
    // 深度合并
    merge(defaultOptions, opt || {}),
  );
}
const request = createAxios();
export default request;
