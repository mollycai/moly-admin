const configs = {
	terminal: 1, // 终端
  title: 'Moly Admin', // 标题
  version: '0.0.1', // 版本
  baseUrl: `${import.meta.env.VITE_APP_BASE_URL}` || '', // 基本路径
  urlPrefix: '', // 路径前缀
  timeout: 10 * 1000, // 超时时间
};

export default configs;
