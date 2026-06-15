<template>
  <div class="space-y-8">
    <section class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-[#342d1e]">Пользователи</h2>
          <p class="mt-2 text-sm text-[#5F4A2F]/80">Управление учётными записями сотрудников. Новых пользователей создаёт только администратор.</p>
        </div>
        <button
          v-if="store.isAdmin"
          @click="openCreateModal"
          class="inline-flex items-center justify-center rounded-3xl bg-[#B89B72] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8B6F47]"
        >
          Добавить пользователя
        </button>
      </div>

      <div class="mt-6 overflow-hidden rounded-[32px] border border-[#E8DDCB] bg-[#F5F1E8]">
        <table class="min-w-full text-left text-sm text-[#5F4A2F]">
          <thead class="bg-white/90 text-[#342d1e]">
            <tr>
              <th class="px-6 py-4">Имя</th>
              <th class="px-6 py-4">Роль</th>
              <th class="px-6 py-4">Логин</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">Телефон</th>
              <th class="px-6 py-4">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in store.users" :key="user.id" class="border-t border-[#E8DDCB] transition hover:bg-[#fff7e8]">
              <td class="px-6 py-5 font-semibold text-[#342d1e]">{{ user.name }}</td>
              <td class="px-6 py-5">
                <span :class="roleBadge(user.role)">{{ user.role }}</span>
              </td>
              <td class="px-6 py-5 font-mono text-xs">{{ user.login }}</td>
              <td class="px-6 py-5">{{ user.email }}</td>
              <td class="px-6 py-5">{{ user.phone }}</td>
              <td class="px-6 py-5"><span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{{ user.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="showModal" class="fixed inset-0 z-[99999] flex items-center justify-center bg-[#342d1e]/50 p-4 backdrop-blur-sm">
      <div class="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-[#342d1e]">Новый пользователь</h3>
            <p class="mt-2 text-sm text-[#5F4A2F]/80">Создайте учётную запись для сотрудника. Регистрация доступна только администратору.</p>
          </div>
          <button @click="closeModal" class="rounded-full bg-[#F5F1E8] px-4 py-2 text-sm text-[#5F4A2F]">Закрыть</button>
        </div>

        <form @submit.prevent="saveUser" class="mt-6 grid gap-4 sm:grid-cols-2">
          <label class="block sm:col-span-2">
            <span class="text-sm font-semibold text-[#5F4A2F]">ФИО</span>
            <input v-model="form.name" required class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm outline-none" />
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Роль</span>
            <select v-model="form.role" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm outline-none">
              <option>Агроном</option>
              <option>Рабочий</option>
              <option>Администратор</option>
            </select>
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Телефон</span>
            <input v-model="form.phone" required class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm outline-none" />
          </label>
          <label class="block sm:col-span-2">
            <span class="text-sm font-semibold text-[#5F4A2F]">Email</span>
            <input v-model="form.email" type="email" required class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm outline-none" />
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Логин</span>
            <input v-model="form.login" required class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm outline-none" />
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Пароль</span>
            <input v-model="form.password" type="password" required minlength="4" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm outline-none" />
          </label>
          <p v-if="error" class="sm:col-span-2 text-sm text-rose-600">{{ error }}</p>
          <div class="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" class="rounded-3xl bg-[#B89B72] px-6 py-3 text-sm font-semibold text-white hover:bg-[#8B6F47]">Создать</button>
            <button type="button" @click="closeModal" class="rounded-3xl border border-[#E8DDCB] bg-white px-6 py-3 text-sm font-semibold text-[#5F4A2F]">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Role } from '@/data/mockData'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const showModal = ref(false)
const error = ref('')
const form = ref({
  name: '',
  role: 'Агроном' as Role,
  email: '',
  phone: '+7 900 000 00 00',
  login: '',
  password: ''
})

function roleBadge(role: Role) {
  if (role === 'Администратор') return 'rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900'
  if (role === 'Агроном') return 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800'
  return 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'
}

function openCreateModal() {
  error.value = ''
  form.value = {
    name: '',
    role: 'Агроном',
    email: '',
    phone: '+7 900 000 00 00',
    login: '',
    password: ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveUser() {
  error.value = ''
  if (store.users.some((item) => item.login === form.value.login.trim())) {
    error.value = 'Пользователь с таким логином уже существует.'
    return
  }
  store.addUser({
    name: form.value.name.trim(),
    role: form.value.role,
    email: form.value.email.trim(),
    phone: form.value.phone.trim(),
    login: form.value.login.trim(),
    password: form.value.password
  })
  showModal.value = false
}
</script>
