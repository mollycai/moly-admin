import { ElLoading, ElMessage, ElMessageBox } from 'element-plus';
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
/**
 * @description feedback提示信息工具类
 */
export class Feedback {
  private loadingInstance: LoadingInstance | null = null;
  private static instance: Feedback | null = null;
  static getInstance() {
    return this.instance ?? (this.instance = new Feedback());
  }
  // 消息提示
  msg(msg: string) {
    ElMessage.info(msg);
  }
  // 成功提示
  msgSuccess(msg: string) {
    ElMessage.success(msg);
  }
  // 错误提示
  msgError(msg: string) {
    ElMessage.error(msg);
  }
  // 警告提示
  msgWarning(msg: string) {
    ElMessage.warning(msg);
  }
  // 确认窗体
  confirm(msg: string) {
    return ElMessageBox.confirm(msg, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
  }
  // 开启全局loading
  loading(msg: string) {
    this.loadingInstance = ElLoading.service({
      lock: true,
      text: msg,
    });
  }
  // 关闭全局loading
  closeLoading() {
    this.loadingInstance?.close();
  }
}

const feedback = new Feedback();

export default feedback;
