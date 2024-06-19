import feedback from '../feedback';

export function checkStatus(status: number, message: string) {
  let errorMessage = '';
  switch (status) {
    case 400:
      errorMessage = `${message}` || '请求错误，请联系管理员！';
      break;
    case 401:
      errorMessage = '用户没有权限（令牌、用户名、密码错误）！';
      break;
    case 403:
      errorMessage = '用户得到授权，但访问被禁止!';
      break;
    case 404:
      errorMessage = '网络请求错误，未找到该资源！';
      break;
    case 405:
      errorMessage = '网络请求错误，请求方法不被允许！';
      break;
    case 408:
      errorMessage = '网络请求超时！';
      break;
    case 500:
      errorMessage = '服务异常，请联系管理员！';
      break;
    case 502:
      errorMessage = '网关错误！';
      break;
    case 503:
      errorMessage = '服务不可用，服务器暂时超载或正在维护！';
      break;
    case 504:
      errorMessage = '网络超时！';
      break;
    case 505:
      errorMessage = 'http版本不支持此请求！';
      break;
    default:
      errorMessage = `${message}`;
  }
  errorMessage && feedback.msgError(errorMessage);
}
