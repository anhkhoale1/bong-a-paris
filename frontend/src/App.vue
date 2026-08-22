<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppToast from "./components/common/AppToast.vue";
import { logout } from "./services/authService.js";

const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const links = [
  { to: "/", label: "Dashboard", icon: "D" },
  { to: "/products", label: "Sản phẩm", icon: "P" },
  { to: "/orders", label: "Đơn hàng", icon: "O" },
  { to: "/pending-purchase", label: "Chưa mua", icon: "!" },
];

const isActive = (to) =>
  to === "/" ? route.path === "/" : route.path.startsWith(to);

function signOut() {
  logout();
  menuOpen.value = false;
  router.replace("/login");
}
</script>

<template>
  <RouterView v-if="route.meta.public" />
  <div v-else class="min-h-screen bg-[#faf9f6] text-[#171717] font-sans">
    <header
      class="sticky top-0 z-30 border-b border-[#e7e4df] bg-[#faf9f6]/95 backdrop-blur-[14px]"
    >
      <div
        class="mx-auto flex min-h-[78px] w-[min(1320px,calc(100%-48px))] items-center gap-8"
      >
        <RouterLink
          class="flex shrink-0 items-center gap-3"
          to="/"
          @click="menuOpen = false"
        >
          <div>
            <strong class="block text-[.94rem] tracking-[-.02em] text-[#171717]"
              >Bống à Paris</strong
            ><small class="mt-0.5 block text-[.7rem] text-slate-400"
              >Sales Manager</small
            >
          </div>
        </RouterLink>
        <nav class="ml-auto hidden items-center gap-1 md:flex">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :class="[
              'rounded-full px-3 py-2 text-sm font-bold transition-colors',
              isActive(link.to)
                ? 'bg-[#e9e5ff] text-[#4338ca]'
                : 'text-slate-500 hover:bg-[#e9e5ff] hover:text-[#4338ca]',
            ]"
            >{{ link.label }}</RouterLink
          >
        </nav>
        <div class="ml-4 hidden items-center gap-4 md:flex">
          <button
            class="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-[#e9e5ff] hover:text-[#171717]"
            type="button"
            @click="signOut"
          >
            Đăng xuất
          </button>
        </div>
        <button
          class="ml-auto grid size-[38px] place-items-center rounded-lg border border-[#d8d4ce] bg-white text-lg text-[#333] md:hidden"
          aria-label="Mở menu"
          @click="menuOpen = !menuOpen"
        >
          ☰
        </button>
      </div>
      <nav
        v-if="menuOpen"
        class="grid gap-1 border-t border-[#e7e4df] bg-[#faf9f6] px-4 pb-4 pt-2 md:hidden"
      >
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="[
            'rounded-lg px-3 py-3 font-bold transition-colors',
            isActive(link.to)
              ? 'bg-[#e9e5ff] text-[#4338ca]'
              : 'text-slate-500 hover:bg-[#e9e5ff] hover:text-[#4338ca]',
          ]"
          @click="menuOpen = false"
          >{{ link.label }}</RouterLink
        >
        <button
          class="mt-1 w-max rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-[#e9e5ff] hover:text-[#171717]"
          type="button"
          @click="signOut"
        >
          Đăng xuất
        </button>
      </nav>
    </header>

    <div class="min-h-[calc(100vh-78px)]">
      <main class="mx-auto w-[min(1320px,calc(100%-48px))] py-14 pb-20">
        <RouterView />
      </main>
    </div>
    <AppToast />
  </div>
</template>
