<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { login } from "../services/authService.js";

const router = useRouter();
const route = useRoute();
const form = reactive({ email: "", password: "" });
const error = ref("");
const submitting = ref(false);

async function submit() {
  error.value = "";
  submitting.value = true;
  try {
    await login(form);
    const redirect =
      typeof route.query.redirect === "string" &&
      route.query.redirect.startsWith("/")
        ? route.query.redirect
        : "/";
    await router.replace(redirect);
  } catch (loginError) {
    error.value = loginError.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main
    class="grid min-h-screen place-items-center bg-[#faf9f6] p-6 max-[600px]:p-[14px]"
  >
    <section
      class="w-[min(430px,100%)] rounded-[24px] border border-[#e6e8ef] bg-white/[.96] p-[38px] shadow-[0_28px_80px_rgba(30,41,59,.14)] max-[600px]:rounded-[19px] max-[600px]:px-[22px] max-[600px]:py-7"
    >
      <div class="mb-7">
        <span
          class="grid size-[52px] place-items-center rounded-[15px] bg-[#171717] font-extrabold text-white"
          >BP</span
        >
      </div>
      <p
        class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
      >
        Không gian quản trị
      </p>
      <h1
        class="mb-2.5 text-[2rem] font-[850] leading-[1.02] tracking-[-.065em] text-gray-900"
      >
        Đăng nhập
      </h1>
      <p class="mb-7 leading-[1.6] text-slate-500">
        Theo dõi sản phẩm, đơn hàng và kết quả kinh doanh của Bống à Paris.
      </p>

      <form
        class="grid gap-[18px] [&_input]:min-h-[43px] [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-[#cfd5e1] [&_input]:bg-white [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-[#1f2937] [&_input]:outline-none [&_input]:transition [&_input]:focus:border-[#7c70ee] [&_input]:focus:shadow-[0_0_0_3px_#ebe8ff]"
        @submit.prevent="submit"
      >
        <div
          v-if="error"
          class="mb-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
          role="alert"
        >
          {{ error }}
        </div>
        <label
          class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
        >
          Email
          <input
            v-model.trim="form.email"
            type="email"
            autocomplete="username"
            required
            autofocus
          />
        </label>
        <label
          class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
        >
          Mật khẩu
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>
        <button
          class="mt-1 inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border border-transparent bg-[#756bea] px-4 py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-[#5b50d6] disabled:cursor-not-allowed disabled:opacity-[.55]"
          type="submit"
          :disabled="submitting"
        >
          {{ submitting ? "Đang đăng nhập…" : "Đăng nhập" }}
        </button>
      </form>
    </section>
  </main>
</template>
