import { ref } from 'vue';

let _toastRef = null;

export function setToastRef(ref) {
  _toastRef = ref;
}

export function useToast() {
  const toast = {
    success(message, title) {
      _toastRef?.value?.addToast(message, 'success', title || 'Berhasil');
    },
    error(message, title) {
      _toastRef?.value?.addToast(message, 'error', title || 'Gagal', 6000);
    },
    warning(message, title) {
      _toastRef?.value?.addToast(message, 'warning', title || 'Peringatan', 5000);
    },
    info(message, title) {
      _toastRef?.value?.addToast(message, 'info', title, 3500);
    }
  };

  return { toast };
}
