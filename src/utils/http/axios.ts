import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import type { RequestOptions, Result, UploadFileParams } from '#/axios';
import { ContentTypeEnum, RequestEnum } from '@/enums/httpEnums';
import { isFunction, isArray, merge, cloneDeep } from 'lodash';
import axiosCancel from './cancel';

export class MAxios {
  private axiosInstance: AxiosInstance;
  private readonly config: AxiosRequestConfig;
  private readonly options: RequestOptions;

  constructor(config: AxiosRequestConfig) {
    this.config = config;
    this.options = config.requestOptions;
    this.axiosInstance = axios.create(config);
    this.setInterceptors();
  }

  /**
   * @description 获取axios实例
   */
  getAxiosInstance() {
    return this.axiosInstance;
  }

  /**
   * @description 设置请求和响应拦截器
   */
  setInterceptors() {
    if (!this.config.axiosHooks) {
      return;
    }
    const {
      requestInterceptorsHook,
      requestInterceptorsCatchHook,
      responseInterceptorsHook,
      responseInterceptorsCatchHook,
    } = this.config.axiosHooks;

    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.addCancelToken(config);
        isFunction(requestInterceptorsHook) && (config = requestInterceptorsHook(config));
        return config;
      },
      (err: AxiosError) => {
        isFunction(requestInterceptorsCatchHook) && requestInterceptorsCatchHook(err);
        return err;
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<Result>) => {
        this.removeCancelToken(response.config.url!);
        isFunction(responseInterceptorsHook) && (response = responseInterceptorsHook(response));
        return response;
      },
      (err: AxiosError) => {
        isFunction(responseInterceptorsCatchHook) && responseInterceptorsCatchHook(err);
        // 配置响应错误时的重新请求
        if (err.code != AxiosError.ERR_CANCELED) {
          this.removeCancelToken(err.config?.url!);
        }
        if (err.code == AxiosError.ECONNABORTED || err.code == AxiosError.ERR_NETWORK) {
          return new Promise((resolve) => setTimeout(resolve, 500)).then(() => this.retryRequest(err));
        }
        return Promise.reject(err);
      },
    );
  }

  /**
   * @description 添加cancelToken
   */
  addCancelToken(config: AxiosRequestConfig) {
    const { ignoreCancelToken } = config.requestOptions;
    !ignoreCancelToken && axiosCancel.add(config);
  }

  /**
   * @description 移除cancelToken
   */
  removeCancelToken(url: string) {
    axiosCancel.remove(url);
  }

  /**
   * @description 重新请求
   */
  retryRequest(error: AxiosError) {
    const config = error.config;
    const { retryCount, isOpenRetry } = config?.requestOptions;
    if (!isOpenRetry || config.method?.toUpperCase() == RequestEnum.POST) {
      return Promise.reject(error);
    }
    config.retryCount = config.retryCount ?? 0;
    if (config.retryCount >= retryCount) {
      return Promise.reject(error);
    }
    config.retryCount++;
    return this.axiosInstance.request(config);
  }

  /**
   * @description 文件上传
   */
  uploadFile<T = any>(config: AxiosRequestConfig, params: UploadFileParams) {
    const formData = new window.FormData();
    const customFilename = params.name || 'file';

    if (params.filename) {
      formData.append(customFilename, params.file, params.filename);
    } else {
      formData.append(customFilename, params.file);
    }

    if (params.data) {
      Object.keys(params.data).forEach((key) => {
        const value = params.data![key];
        if (isArray(value)) {
          value.forEach((val) => {
            formData.append(`${key}[]`, val);
          });
          return;
        }
        formData.append(key, value);
      });
    }

    return this.axiosInstance.request<T>({
      ...config,
      method: 'POST',
      data: formData,
      headers: {
        'Content-type': ContentTypeEnum.FORM_DATA,
      },
    });
  }

  request<T = any>(config: Partial<AxiosRequestConfig>, options?: Partial<RequestOptions>): Promise<T> {
    // 处理，合并axios配置
    const opt = merge({}, this.options, options);
    const axiosConfig: AxiosRequestConfig = {
      ...cloneDeep(config),
      requestOptions: opt,
    };
    // 单独处理拼接url
    const { urlPrefix } = opt;
    urlPrefix && (axiosConfig.url = `${urlPrefix}${config.url}`);

    return new Promise<T>((resolve, reject) => {
      this.axiosInstance
        .request<any, T>(axiosConfig)
        .then((res: T) => {
          resolve(res);
        })
        .catch((e: Error) => {
          reject(e);
        });
    });
  }

  get<T = any>(config: Partial<AxiosRequestConfig>, options?: Partial<RequestOptions>): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options);
  }

  post<T = any>(config: Partial<AxiosRequestConfig>, options?: Partial<RequestOptions>): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options);
  }

  put<T = any>(config: Partial<AxiosRequestConfig>, options?: Partial<RequestOptions>): Promise<T> {
    return this.request({ ...config, method: 'PUT' }, options);
  }

  patch<T = any>(config: Partial<AxiosRequestConfig>, options?: Partial<RequestOptions>): Promise<T> {
    return this.request({ ...config, method: 'PATCH' }, options);
  }

  delete<T = any>(config: Partial<AxiosRequestConfig>, options?: Partial<RequestOptions>): Promise<T> {
    return this.request({ ...config, method: 'DELETE' }, options);
  }
}
