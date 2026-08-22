import { readonly, ref } from "vue";

const notification = ref(null);
let timeout;

export function useNotification() {
  function notify(message, type = "success") {
    clearTimeout(timeout);
    notification.value = { message, type };
    timeout = setTimeout(() => {
      notification.value = null;
    }, 3500);
  }

  function dismiss() {
    clearTimeout(timeout);
    notification.value = null;
  }

  return { notification: readonly(notification), notify, dismiss };
}
