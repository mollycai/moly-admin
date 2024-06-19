import { cacheType } from '@/enums/cacheEnums';

const prefixKey = 'MOLY_ADMIN_';

/**
 * @description WebStorage缓存工具类
 */
export class WebStroage {
  private storage: Storage;

  constructor(type: cacheType) {
    this.storage = type === cacheType.LOCAL ? localStorage : sessionStorage;
  }

  private getKey(key: string) {
    return `${prefixKey}${key}`.toUpperCase();
  }

  get(key: string) {
    key = this.getKey(key);
    const data = this.storage.getItem(key);
    if (!data) {
      return;
    }
    const { expire, value } = JSON.parse(data);
    if (expire && expire < this.time()) {
      this.storage.removeItem(key);
      return null;
    }
    return value;
  }

  set(key: string, value: any, expire?: string) {
    key = this.getKey(key);
    // 设置缓存（expire是缓存时效）
    let data: any = {
      expire: expire ? this.time() + expire : '',
      value,
    };
    data = JSON.stringify(data);
    this.storage.setItem(key, data);
  }

  remove(key: string) {
    this.storage.removeItem(this.getKey(key));
  }

  clear() {
    this.storage.clear();
  }

  time() {
    return Math.round(new Date().getTime() / 1000);
  }
}

const localCache = new WebStroage(cacheType.LOCAL);
const sessionCache = new WebStroage(cacheType.SESSION);

export { localCache, sessionCache };
