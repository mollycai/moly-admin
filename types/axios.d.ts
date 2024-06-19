import { AxiosError, AxiosRequestConfig } from 'axios';

declare module 'axios' {
  // 扩展 RouteMeta
  interface AxiosRequestConfig {
    retryCount?: number;
    axiosHooks?: AxiosHooks;
    requestOptions: RequestOptions;
  }
}

// 后端返回数据的类型
export interface Result<T = any> {
  code: number;
  message: string;
  data: T;
}

// 请求的自定义参数
export interface RequestOptions {
	//是否返回默认的响应
  isReturnDefaultResponse: boolean;
	// 需要对返回数据进行处理
  isTransformResponse: boolean;
	// 接口拼接地址
  urlPrefix: string;
	// 忽略重复请求
  ignoreCancelToken: boolean;
	// 是否携带token
  withToken: boolean;
	// 是否将param转为data
  isParamsToData: boolean;
	// 开启请求超时重新发起请求请求机制
  isOpenRetry: boolean;
	// 重新请求次数
  retryCount: number;
}

// 上传文件使用的参数的类型
export interface UploadFileParams<T = any> {
	// 其他参数
  data?: Record<string, T>;
	// file interface field name
  name?: string;
	// 文件
  file: File | Blob;
	// 文件名
  filename?: string;
	// 自定义
  [key: string]: any;
}

// 请求拦截器钩子的类型
export interface AxiosHooks {
	// 请求拦截器
  requestInterceptorsHook?: (config: AxiosRequestConfig) => AxiosRequestConfig; 
	// 请求拦截器的错误处理
  requestInterceptorsCatchHook?: (error:AxiosError) => void;
	// 响应拦截器
  responseInterceptorsHook?: (response: AxiosResponse<Result<T>>) => AxiosResponse<Result> | Result | T;
	// 响应拦截器的错误处理
  responseInterceptorsCatchHook?: (error: AxiosError) => void; 
}
