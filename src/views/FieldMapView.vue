<template>
  <div class="page-enter space-y-10">
    <div v-if="store.isWorker" class="rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] px-5 py-4 text-sm text-[#5F4A2F]">
      Режим <strong>рабочего</strong>: карта, задачи и календарь — просмотр и отметки на поле. Редактирование полей и аналитика недоступны.
    </div>
    <section class="grid gap-8 xl:grid-cols-[320px_1fr_320px]">
      <div class="space-y-6 rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
        <div>
          <h2 class="text-lg font-semibold text-[#342d1e]">Фильтры полей</h2>
          <p class="mt-2 text-sm text-[#5F4A2F]/80">Уточните выбор по культуре, статусу и ответственному агроному.</p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-[#5F4A2F]">Культура</label>
            <select v-model="store.activeCrop" class="w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none">
              <option value="">Все культуры</option>
              <option v-for="crop in store.fieldCropOptions" :key="crop" :value="crop">{{ crop }}</option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-[#5F4A2F]">Статус</label>
            <select v-model="store.activeStatus" class="w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none">
              <option value="">Все статусы</option>
              <option v-for="status in store.fieldStatusOptions" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-[#5F4A2F]">Агроном</label>
            <select v-model="store.activeAgronomist" class="w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none">
              <option value="">Все агрономы</option>
              <option v-for="user in store.agronomistOptions" :key="user" :value="user">{{ user }}</option>
            </select>
          </div>
        </div>

        <div class="rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-5 shadow-inner">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-[0.24em] text-[#8B6F47]/80">Агрономический помощник</h3>
            <span class="text-[10px] uppercase tracking-[0.2em] text-[#8B6F47]/60">Live</span>
          </div>
          <div class="mt-4 space-y-3 text-sm text-[#5F4A2F]">
            <div v-for="item in store.recommendations" :key="item.id" class="flex gap-3 rounded-3xl bg-white/90 p-4 shadow-sm">
              <span :class="recommendationBadgeClass(item.icon)"></span>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-[28px] border border-[#E8DDCB] bg-white/90 p-5 shadow-soft">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-[#342d1e]">Индексы рисков</p>
            <span class="text-xs uppercase tracking-[0.2em] text-[#8B6F47]/70">Поле №{{ store.selectedField.number }}</span>
          </div>
          <div class="mt-4 grid gap-3">
            <div v-for="risk in store.riskIndexes" :key="risk.id" :class="`rounded-3xl p-4 ${risk.color}`">
              <p class="text-xs uppercase tracking-[0.24em] opacity-80">{{ risk.title }}</p>
              <p class="mt-2 text-lg font-semibold">{{ risk.value }}</p>
              <p class="mt-2 text-xs opacity-80">{{ risk.hint }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="rounded-[32px] border border-[#E8DDCB] bg-white/90 p-4 shadow-soft">
          <div class="flex flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Карта полей</p>
              <h2 class="text-xl font-semibold text-[#342d1e]">{{ store.selectedRegion.name }}</h2>
              <p class="mt-1 text-xs text-[#5F4A2F]/75">{{ store.selectedRegion.type }}<span v-if="store.selectedRegion.parent"> · {{ store.selectedRegion.parent }}</span></p>
            </div>
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
              <button v-if="store.can('fields.draw')" @click="startDrawing" class="rounded-3xl bg-[#8B6F47] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6B5C37]">Нарисовать поле</button>
              <button @click="toggleFullscreen" class="rounded-3xl bg-[#B89B72] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B6F47]">Развернуть карту</button>
            </div>
          </div>
          <div class="mt-4 rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-4 shadow-inner">
            <p class="text-sm font-semibold text-[#342d1e]">Локация на карте</p>
            <p class="mt-1 text-xs text-[#5F4A2F]/75">
              Поиск по {{ settlementsLabel }} населённым пунктам России (от 1 000 жителей) — регион, город, село, посёлок.
            </p>
            <div class="relative mt-4" @focusin="onRegionFocusIn" @focusout="onRegionFocusOut">
              <input
                v-model="regionSearch"
                type="text"
                placeholder="Сросты, Алтайский край, Москва, Краснодар..."
                class="w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm text-[#342d1e] outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
                @input="onRegionInput"
                @keydown.enter.prevent="pickFirstSuggestion"
                @keydown.down.prevent="pickFirstSuggestion"
              />
              <div
                v-if="showRegionSuggestions && (regionSuggestions.length || settlementsLoading)"
                class="absolute left-0 right-0 top-full z-[1000] mt-2 max-h-72 overflow-y-auto rounded-[24px] border border-[#E8DDCB] bg-white p-2 shadow-2xl"
              >
                <p v-if="settlementsLoading" class="px-4 py-3 text-xs text-[#8B6F47]">Загрузка базы населённых пунктов…</p>
                <button
                  v-for="region in regionSuggestions"
                  :key="region.id"
                  type="button"
                  @mousedown.prevent="pickRegion(region)"
                  class="flex w-full items-center justify-between rounded-3xl px-4 py-3 text-left transition hover:bg-[#F5F1E8]"
                >
                  <span>
                    <span class="block text-sm font-semibold text-[#342d1e]">{{ region.name }}</span>
                    <span class="mt-1 block text-xs text-[#5F4A2F]/75">
                      {{ region.type }}<span v-if="region.parent"> · {{ region.parent }}</span>
                      <span v-if="region.population"> · {{ region.population.toLocaleString('ru-RU') }} чел.</span>
                    </span>
                  </span>
                  <span class="rounded-full bg-[#F5F1E8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B6F47]">{{ region.type }}</span>
                </button>
              </div>
              <p v-if="regionSearch.trim().length >= 2 && !regionSuggestions.length && !settlementsLoading" class="mt-2 text-xs text-[#5F4A2F]/70">
                Не найдено. Попробуйте «Сросты», «Тула», «Краснодар».
              </p>
            </div>
            <div class="mt-4 flex flex-wrap items-center gap-2 rounded-3xl bg-white px-4 py-3 text-sm">
              <span class="text-[#5F4A2F]/75">Выбрано:</span>
              <span class="font-semibold text-[#342d1e]">{{ store.selectedRegion.name }}</span>
              <span class="rounded-full bg-[#F5F1E8] px-3 py-1 text-xs text-[#8B6F47]">{{ store.selectedRegion.type }}</span>
            </div>
          </div>
          <div class="mt-4 w-full md:max-w-md">
            <label class="mb-2 block text-sm font-semibold text-[#5F4A2F]">Поиск по полям</label>
            <input v-model="store.searchTerm" type="text" placeholder="номер, имя, культура, агроном" class="w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200" />
          </div>
          <div v-if="store.autocomplete.length" class="mt-3 space-y-2 rounded-3xl bg-[#F5F1E8] p-3 text-sm">
            <p class="text-[#5F4A2F]/75">Подсказки</p>
            <ul class="space-y-2">
              <li v-for="field in store.autocomplete" :key="field.id" @click="store.selectField(field.id)" class="cursor-pointer rounded-3xl px-4 py-3 transition hover:bg-amber-100/80">
                <p class="font-semibold text-[#342d1e]">{{ field.name }}</p>
                <p class="text-xs text-[#5F4A2F]/80">{{ field.crop }} • {{ field.agronomist }}</p>
              </li>
            </ul>
          </div>
          <div class="mt-4 grid gap-3 px-4 pb-4 md:grid-cols-2">
            <div class="rounded-3xl bg-[#F5F1E8] p-4">
              <p class="text-sm text-[#5F4A2F]/80">Поля</p>
              <p class="mt-2 text-2xl font-semibold text-[#342d1e]">{{ store.filteredFields.length }}</p>
            </div>
            <div class="rounded-3xl bg-[#F5F1E8] p-4">
              <p class="text-sm text-[#5F4A2F]/80">Активных задач</p>
              <p class="mt-2 text-2xl font-semibold text-[#342d1e]">{{ activeTasks }}</p>
            </div>
          </div>
          <div class="relative h-[420px] overflow-hidden rounded-[28px] border border-[#E8DDCB] md:h-[620px]">
            <div
              v-if="store.showNightMapBadge"
              class="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-full border border-indigo-300/40 bg-indigo-950/80 px-4 py-2 text-xs font-semibold text-indigo-100 shadow-lg backdrop-blur"
            >
              <span class="h-2 w-2 animate-pulse rounded-full bg-indigo-300"></span>
              Ночной режим · засчитано
            </div>
            <div ref="mapContainer" class="h-full w-full z-0"></div>

            <div v-if="drawingMode" class="draw-panel absolute left-4 right-4 top-4 z-[1000] rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-2xl backdrop-blur-md">
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/80">Режим рисования</p>
                  <h3 class="mt-1 text-lg font-semibold text-[#342d1e]">Обведите контур нового поля</h3>
                  <p class="mt-2 text-sm text-[#5F4A2F]/80">Клик — новая точка. Перетаскивайте точки для коррекции контура. Минимум 3 точки.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="inline-flex items-center rounded-full bg-[#F5F1E8] px-4 py-2 text-sm font-semibold text-[#5F4A2F]">Точек: {{ drawPoints.length }}</span>
                  <span v-if="previewArea" class="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">~ {{ previewArea }} га</span>
                </div>
                <div v-if="previewArea > 0" class="mt-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-6 py-4 text-center">
                  <p class="text-xs uppercase tracking-[0.28em] text-emerald-800/70">Площадь контура</p>
                  <p class="mt-1 text-4xl font-bold tabular-nums text-emerald-900">~ {{ previewArea.toFixed(1) }} га</p>
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                <button @click="undoDrawAction" :disabled="!drawPoints.length && !drawHistory.length" class="rounded-3xl border border-[#E8DDCB] bg-white px-4 py-2 text-sm font-semibold text-[#5F4A2F] disabled:opacity-40">Отменить действие</button>
                <button @click="undoDrawPoint" :disabled="!drawPoints.length" class="rounded-3xl border border-[#E8DDCB] bg-white px-4 py-2 text-sm font-semibold text-[#5F4A2F] disabled:opacity-40">Отменить точку</button>
                <button @click="finishDrawing" :disabled="drawPoints.length < 3" class="rounded-3xl bg-[#8B6F47] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Завершить контур</button>
                <button @click="cancelDrawing" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">Отмена</button>
              </div>
            </div>

            <div v-if="measureMessage" class="absolute bottom-4 left-4 right-4 z-[1000] rounded-3xl bg-[#342d1e]/85 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur-sm">
              {{ measureMessage }}
            </div>
          </div>
          <div class="mt-4 grid gap-3 rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-4 text-sm text-[#5F4A2F] shadow-inner">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span class="font-semibold text-[#342d1e]">Настройки карты</span>
              <label class="inline-flex items-center gap-2 text-xs">
                <input type="checkbox" :checked="store.showCropColors" @change="store.setShowCropColors(($event.target as HTMLInputElement).checked)" />
                Подсветка по культурам
              </label>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="layer in baseLayerOptions"
                :key="layer.id"
                @click="store.setMapBaseLayer(layer.id)"
                :class="store.effectiveMapBaseLayer === layer.id ? 'rounded-full bg-[#8B6F47] px-3 py-1.5 text-xs font-semibold text-white' : 'rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#5F4A2F] border border-[#E8DDCB]'"
              >
                {{ layer.label }}
              </button>
            </div>
            <div v-if="store.showCropColors" class="grid grid-cols-2 gap-2 pt-1">
              <div v-for="(style, crop) in cropLegend" :key="crop" class="flex items-center gap-2 rounded-2xl bg-white px-3 py-2">
                <span class="crop-legend-dot" :style="{ background: style.fill, borderColor: style.stroke }"></span>
                <span>{{ crop }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between border-t border-[#E8DDCB] pt-3">
              <span>Слои</span>
              <div class="flex flex-wrap gap-2">
                <button @click="store.showTasksLayer = !store.showTasksLayer" :class="layerButton(store.showTasksLayer)">Задачи</button>
                <button @click="store.showEquipmentLayer = !store.showEquipmentLayer" :class="layerButton(store.showEquipmentLayer)">Техника</button>
                <button @click="store.setShowNdviLayer(!store.showNdviLayer)" :class="layerButton(store.showNdviLayer)">NDVI</button>
                <button @click="store.setShowScoutingLayer(!store.showScoutingLayer)" :class="layerButton(store.showScoutingLayer)">Обход</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-5 rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
        <div class="panel-soft !bg-[#F5F1E8] !shadow-none">
          <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/75">Выбранное поле</p>
          <p class="mt-3 text-2xl font-semibold text-[#342d1e]">Поле №{{ store.selectedField.number }}</p>
          <p class="mt-2 text-sm text-[#5F4A2F]/80">{{ store.selectedField.name }}</p>
          <p class="mt-3 text-sm leading-relaxed text-[#5F4A2F]/90">{{ fieldSummary }}</p>
        </div>

        <div class="grid gap-3 rounded-[24px] bg-white p-4 shadow-sm">
          <DetailRow label="Культура" :value="store.selectedField.crop" />
          <DetailRow label="Площадь" :value="store.selectedField.area + ' га'" />
          <DetailRow label="Дата посева" :value="store.selectedField.sowDate" />
          <DetailRow label="Статус" :value="store.selectedField.status" />
          <DetailRow label="Урожайность" :value="store.selectedField.yield + ' т/га'" />
          <DetailRow label="Агроном" :value="store.selectedField.agronomist" />
        </div>

        <div class="field-actions">
          <button type="button" class="btn-primary w-full" @click="viewSelectedField">Показать на карте</button>
          <div class="grid grid-cols-2 gap-2">
            <button v-if="store.can('fields.edit')" type="button" class="btn-ghost" @click="openEditField()">Редактировать</button>
            <button v-if="store.can('history.view')" type="button" class="btn-ghost" @click="goToHistory">История</button>
          </div>

          <div v-if="store.can('arrival.mark') || store.can('scouting.add')" class="panel-soft space-y-3 !p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-[#8B6F47]/75">Выезд бригады</p>
            <button v-if="store.can('arrival.mark')" type="button" class="btn-secondary w-full" :disabled="arrivalLoading" @click="markArrival">
              {{ arrivalLoading ? 'Проверка GPS…' : 'Прибыл на поле' }}
            </button>
            <p v-if="arrivalLabel" class="text-xs leading-relaxed text-emerald-800">{{ arrivalLabel }}</p>
            <div v-if="store.can('fields.view')" class="rounded-2xl border border-dashed border-[#E8DDCB] bg-white/70 px-3 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B6F47]/75">Маршрут до поля</p>
              <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <button type="button" class="text-xs font-semibold text-[#3A5A24] underline-offset-2 hover:underline" @click="openRoute('yandex-nav')">
                  Яндекс Навигатор
                </button>
                <button type="button" class="text-xs font-semibold text-[#8B6F47] underline-offset-2 hover:underline" @click="openRoute('yandex-maps')">
                  Яндекс Карты
                </button>
                <button type="button" class="text-xs font-semibold text-[#5F4A2F] underline-offset-2 hover:underline" @click="openRoute('2gis')">
                  2GIS
                </button>
              </div>
            </div>
            <button
              v-if="store.can('scouting.add')"
              type="button"
              class="w-full rounded-2xl px-4 py-2.5 text-sm font-semibold transition"
              :class="scoutingMode ? 'bg-[#8B6F47] text-white' : 'btn-secondary'"
              @click="toggleScoutingMode"
            >
              {{ scoutingMode ? 'Обход: кликните на карте' : 'Обход — отметить проблему' }}
            </button>
            <p class="text-[11px] leading-relaxed text-[#5F4A2F]/70">
              Задачу «Выполнено» можно закрыть только с GPS внутри контура поля.
            </p>
          </div>
        </div>

        <div v-if="fieldScouts.length" class="panel-soft space-y-3 !p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-[#8B6F47]/75">Последние отметки обхода</p>
          <div v-for="scout in fieldScouts.slice(0, 4)" :key="scout.id" class="rounded-2xl bg-white/90 px-4 py-3 text-sm">
            <p class="font-semibold text-[#342d1e]">{{ scoutKindLabel(scout.kind) }}</p>
            <p class="mt-1 text-xs text-[#5F4A2F]/80">{{ scout.comment }}</p>
            <p class="mt-1 text-[10px] text-[#8B6F47]/70">{{ formatScoutDate(scout.createdAt) }} · {{ scout.author }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="store.showWeather" class="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Погодный модуль</p>
            <h2 class="mt-2 text-xl font-semibold text-[#342d1e]">Текущие условия и прогноз</h2>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <span class="rounded-3xl bg-[#F5F1E8] px-4 py-2 text-sm text-[#5F4A2F]">{{ store.weather.station }}</span>
            <button @click="store.loadWeather()" :disabled="store.weatherLoading" class="rounded-3xl bg-[#B89B72] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8B6F47] disabled:opacity-60">
              {{ store.weatherLoading ? 'Обновление…' : 'Обновить' }}
            </button>
          </div>
        </div>
        <p v-if="store.weatherError" class="mt-4 rounded-3xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{{ store.weatherError }}</p>
        <p v-if="store.weather.updatedAt" class="mt-2 text-xs text-[#5F4A2F]/70">Обновлено: {{ store.weather.updatedAt }}</p>

        <div class="mt-6">
          <SprayWindowCard />
        </div>

        <div class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Температура" :value="store.weather.temperature" />
          <StatCard title="Влажность" :value="store.weather.humidity" />
          <StatCard title="Давление" :value="store.weather.pressure" />
          <StatCard title="Ветер" :value="store.weather.wind" />
        </div>
        <div class="mt-6 overflow-hidden rounded-[32px] border border-[#E8DDCB] bg-[#F5F1E8] p-4 shadow-inner">
          <div class="grid gap-3 md:grid-cols-4">
            <div class="rounded-3xl bg-white p-4 text-center">
              <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/70">Осадки</p>
              <p class="mt-3 text-lg font-semibold text-[#342d1e]">{{ store.weather.precipitation }}</p>
            </div>
            <div class="rounded-3xl bg-white p-4 text-center">
              <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/70">Облачность</p>
              <p class="mt-3 text-lg font-semibold text-[#342d1e]">{{ store.weather.cloudiness }}</p>
            </div>
            <div class="rounded-3xl bg-white p-4 text-center">
              <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/70">7 дней</p>
              <p class="mt-3 text-lg font-semibold text-[#342d1e]">Прогноз</p>
            </div>
            <div class="rounded-3xl bg-white p-4 text-center">
              <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/70">Регион</p>
              <p class="mt-3 text-lg font-semibold text-[#342d1e]">{{ store.selectedRegion.name }}</p>
            </div>
          </div>
        </div>
        <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <div v-for="forecast in store.weather.forecast" :key="forecast.day" class="rounded-3xl bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p class="text-sm font-semibold text-[#342d1e]">{{ forecast.day }}</p>
            <p class="mt-2"><span class="weather-code">{{ weatherCodeLabel(forecast.icon) }}</span></p>
            <p class="mt-2 text-lg font-bold text-[#8B6F47]">{{ forecast.temp }}</p>
            <p class="mt-1 text-xs text-[#5F4A2F]/80">{{ forecast.rain }}</p>
            <p class="text-xs text-[#5F4A2F]/80">Ветер {{ forecast.wind }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
        <h2 class="text-lg font-semibold text-[#342d1e]">Сводка по выбранному полю</h2>
        <p class="mt-1 text-sm text-[#5F4A2F]/75">Поле №{{ store.selectedField.number }} · {{ store.selectedField.name }}</p>

        <div class="mt-5 space-y-3">
          <div class="rounded-3xl bg-[#F5F1E8] px-4 py-3 text-sm">
            <p class="text-[#5F4A2F]/80">Влажность почвы</p>
            <p class="mt-1 text-lg font-semibold text-[#342d1e]">{{ store.selectedField.humidity }}%</p>
          </div>
          <div class="rounded-3xl bg-[#F5F1E8] px-4 py-3 text-sm">
            <p class="text-[#5F4A2F]/80">Индекс здоровья</p>
            <p class="mt-1 text-lg font-semibold text-[#342d1e]">{{ store.selectedField.healthIndex }}</p>
          </div>
          <div class="rounded-3xl bg-[#F5F1E8] px-4 py-3 text-sm">
            <p class="text-[#5F4A2F]/80">Ожидаемая урожайность</p>
            <p class="mt-1 text-lg font-semibold text-[#342d1e]">{{ store.selectedField.yield }} т/га</p>
          </div>
          <div class="rounded-3xl bg-[#F5F1E8] px-4 py-3 text-sm">
            <p class="text-[#5F4A2F]/80">Последняя операция</p>
            <p class="mt-1 font-semibold text-[#342d1e]">{{ lastFieldOperation }}</p>
          </div>
          <div class="rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm">
            <p class="text-[#5F4A2F]/80">Окно опрыскивания</p>
            <p class="mt-1 font-semibold" :class="spraySummaryClass">{{ spraySummaryLabel }}</p>
          </div>
          <div v-if="fieldScouts.length" class="rounded-3xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p class="text-amber-900/80">Отметки обхода</p>
            <p class="mt-1 font-semibold">{{ fieldScouts.length }} на этом поле</p>
          </div>
        </div>
      </div>
    </section>

    <div v-if="showFieldModal" class="fixed inset-0 z-[99999] flex items-center justify-center bg-[#342d1e]/50 p-4 backdrop-blur-sm">
      <div class="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-[#342d1e]">{{ editorMode === 'create' ? 'Новое поле' : 'Редактировать поле' }}</h3>
            <p class="mt-2 text-sm text-[#5F4A2F]/80">
              {{ editorMode === 'create' && drawnCoordinates ? 'Контур нарисован на карте. Площадь рассчитана автоматически.' : 'Заполните данные для поля.' }}
            </p>
          </div>
          <button @click="closeFieldModal" class="rounded-full bg-[#F5F1E8] px-4 py-2 text-sm text-[#5F4A2F] transition hover:bg-[#E8DDCB]">Закрыть</button>
        </div>
        <form @submit.prevent="saveField" class="mt-6 grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Название поля</span>
            <input v-model="fieldForm.name" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none" />
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Культура</span>
            <select v-model="fieldForm.crop" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none">
              <option>Пшеница</option>
              <option>Кукуруза</option>
              <option>Подсолнечник</option>
              <option>Соя</option>
            </select>
            <p v-if="store.showCropColors" class="mt-2 flex items-center gap-2 text-xs text-[#5F4A2F]/80">
              <span class="crop-legend-dot" :style="{ background: resolveCropStyle(fieldForm.crop, true).fill, borderColor: resolveCropStyle(fieldForm.crop, true).stroke }"></span>
              Цвет на карте обновится сразу после выбора культуры
            </p>
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Площадь (га)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="fieldForm.area"
              inputmode="decimal"
              @keydown="useCommaAsDot"
              @input="normalizeDecimalFieldInput"
              class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none"
            />
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Агроном</span>
            <select v-model="fieldForm.agronomist" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none">
              <option v-for="user in store.agronomistOptions" :key="user">{{ user }}</option>
            </select>
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Статус</span>
            <select v-model="fieldForm.status" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none">
              <option>Активно</option>
              <option>Внимание</option>
              <option>Завершено</option>
            </select>
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Дата посева</span>
            <input type="text" v-model="fieldForm.sowDate" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none" />
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Урожайность</span>
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="fieldForm.yield"
              inputmode="decimal"
              @keydown="useCommaAsDot"
              @input="normalizeDecimalFieldInput"
              class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none"
            />
          </label>
          <div class="sm:col-span-2 flex flex-wrap gap-3 pt-2">
            <button type="submit" class="rounded-3xl bg-[#B89B72] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8B6F47] whitespace-nowrap">
              {{ editorMode === 'create' ? 'Сохранить поле' : 'Применить' }}
            </button>
            <button type="button" @click="closeFieldModal" class="rounded-3xl border border-[#E8DDCB] bg-white px-6 py-3 text-sm font-semibold text-[#5F4A2F] transition hover:bg-[#F5F1E8] whitespace-nowrap">Отмена</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="fullscreen" class="fixed inset-0 z-[99999] flex flex-col bg-[#F5F1E8]">
      <div class="flex items-center justify-between border-b border-[#E8DDCB] bg-white px-5 py-4 shadow-sm">
        <div>
          <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/80">Панорамная карта</p>
          <h3 class="text-xl font-semibold text-[#342d1e]">{{ store.selectedRegion.name }}</h3>
        </div>
        <button @click="toggleFullscreen" class="rounded-3xl bg-[#B89B72] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8B6F47]">Закрыть</button>
      </div>
      <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside class="w-full shrink-0 border-b border-[#E8DDCB] bg-white p-4 lg:w-80 lg:border-b-0 lg:border-r lg:overflow-y-auto">
          <div class="space-y-4">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-[#8B6F47]/80">Поиск локации</p>
              <div class="relative mt-2" @focusin="onRegionFocusIn" @focusout="onRegionFocusOut">
                <input
                  v-model="regionSearch"
                  type="text"
                  placeholder="Город, село, регион..."
                  class="w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm outline-none"
                  @input="onRegionInput"
                />
                <div v-if="showRegionSuggestions && (regionSuggestions.length || settlementsLoading)" class="absolute left-0 right-0 top-full z-[1000] mt-2 max-h-48 overflow-y-auto rounded-3xl border border-[#E8DDCB] bg-white p-2 shadow-xl">
                  <button v-for="region in regionSuggestions" :key="region.id" type="button" @mousedown.prevent="pickRegion(region)" class="block w-full rounded-2xl px-3 py-2 text-left text-sm hover:bg-[#F5F1E8]">
                    {{ region.name }} · {{ region.type }}<span v-if="region.population"> · {{ region.population.toLocaleString('ru-RU') }}</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button v-for="layer in baseLayerOptions" :key="layer.id" @click="store.setMapBaseLayer(layer.id)" :class="store.effectiveMapBaseLayer === layer.id ? 'rounded-full bg-[#8B6F47] px-3 py-1 text-xs font-semibold text-white' : 'rounded-full border border-[#E8DDCB] bg-white px-3 py-1 text-xs text-[#5F4A2F]'">{{ layer.label }}</button>
            </div>
            <label class="flex items-center gap-2 text-sm text-[#5F4A2F]">
              <input type="checkbox" :checked="store.showCropColors" @change="store.setShowCropColors(($event.target as HTMLInputElement).checked)" />
              Подсветка по культурам
            </label>
            <div class="grid gap-2">
              <button @click="store.showTasksLayer = !store.showTasksLayer" :class="sidebarLayerButton(store.showTasksLayer)">Задачи</button>
              <button @click="store.showEquipmentLayer = !store.showEquipmentLayer" :class="sidebarLayerButton(store.showEquipmentLayer)">Техника</button>
              <button @click="store.setShowNdviLayer(!store.showNdviLayer)" :class="sidebarLayerButton(store.showNdviLayer)">NDVI · здоровье поля</button>
              <button @click="store.setShowScoutingLayer(!store.showScoutingLayer)" :class="sidebarLayerButton(store.showScoutingLayer)">Обход · метки</button>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button @click="zoomMap(1)" class="rounded-3xl bg-[#F5F1E8] px-3 py-2 text-sm">+ Zoom</button>
              <button @click="zoomMap(-1)" class="rounded-3xl bg-[#F5F1E8] px-3 py-2 text-sm">− Zoom</button>
              <button @click="startMeasureArea" :class="toolButton(measureMode === 'area')">Площадь</button>
              <button @click="startMeasureDistance" :class="toolButton(measureMode === 'distance')">Расстояние</button>
            </div>
          </div>
        </aside>
        <div class="relative min-h-[320px] min-w-0 flex-1">
          <div ref="fullscreenMap" class="leaflet-fullscreen-map absolute inset-0 h-full w-full"></div>
          <div v-if="measureMessage" class="absolute bottom-4 left-4 right-4 z-[1000] rounded-3xl bg-[#342d1e]/90 px-4 py-3 text-center text-sm font-semibold text-white">{{ measureMessage }}</div>
        </div>
      </div>
    </div>
    <TetrisModal v-if="showTetris" @close="showTetris = false" />
    <ScoutReportModal
      v-if="scoutDraft"
      :field-id="scoutDraft.fieldId"
      :field-name="scoutDraft.fieldName"
      :lat="scoutDraft.lat"
      :lng="scoutDraft.lng"
      @close="scoutDraft = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { searchRegions, ensureSettlementsLoaded, settlementsRevision, settlementsLoading, getSettlementsStats, type MapRegion } from '@/data/regions'
import { normalizeSearchText } from '@/utils/search'
import TetrisModal from '@/components/easterEggs/TetrisModal.vue'
import type { Crop } from '@/data/mockData'
import { polygonAreaHectares, polygonCenter, haversineDistance, pointInPolygon } from '@/utils/geo'
import { evaluateSprayWindow } from '@/utils/sprayWindow'
import { fieldDestination, openFieldNavigation, type NavigationProvider } from '@/utils/navigation'
import SprayWindowCard from '@/components/SprayWindowCard.vue'
import ScoutReportModal from '@/components/ScoutReportModal.vue'
import type { ScoutKind } from '@/data/mockData'
import { cropStyles, resolveCropStyle, ndviStyle } from '@/utils/cropStyles'
import { createBaseLayer, baseLayerLabel, type BaseLayerId } from '@/utils/mapLayers'
import { recommendationBadgeClass, weatherCodeLabel } from '@/utils/uiBadges'
import { normalizeDecimalFieldInput, parseRuDecimal, useCommaAsDot } from '@/utils/parseDecimal'
import L from 'leaflet'
import 'leaflet.markercluster'

const store = useAppStore()
const router = useRouter()
const mapContainer = ref<HTMLDivElement | null>(null)
const fullscreenMap = ref<HTMLDivElement | null>(null)
const map = ref<L.Map | null>(null)
const fullscreenMapInstance = ref<L.Map | null>(null)
const fieldLayer = ref<L.LayerGroup | null>(null)
const overlayLayer = ref<L.LayerGroup | null>(null)
const fullscreenFieldLayer = ref<L.LayerGroup | null>(null)
const fullscreenOverlayLayer = ref<L.LayerGroup | null>(null)
const drawLayer = ref<L.LayerGroup | null>(null)
const drawShapeLayer = ref<L.LayerGroup | null>(null)
const drawHandleMarkers = ref<L.Marker[]>([])
const mainBaseTile = ref<L.TileLayer | null>(null)
const fullscreenBaseTile = ref<L.TileLayer | null>(null)
const fieldPreview = ref<{ id: string; crop: string } | null>(null)
const measureLayer = ref<L.LayerGroup | null>(null)
const fullscreenMeasureLayer = ref<L.LayerGroup | null>(null)
const fullscreen = ref(false)
const showFieldModal = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const drawingMode = ref(false)
const drawPoints = ref<[number, number][]>([])
const drawHistory = ref<[number, number][][]>([])
const drawnCoordinates = ref<[number, number][] | null>(null)
const measureMode = ref<'none' | 'area' | 'distance'>('none')
const measurePoints = ref<[number, number][]>([])
const measureMessage = ref('')
const regionSearch = ref('')
const showRegionSuggestions = ref(false)
const showTetris = ref(false)
const scoutingMode = ref(false)
const scoutDraft = ref<{ fieldId: string; fieldName: string; lat: number; lng: number } | null>(null)
const arrivalLoading = ref(false)
const baseLayerOptions = [
  { id: 'standard' as BaseLayerId, label: baseLayerLabel('standard') },
  { id: 'light' as BaseLayerId, label: baseLayerLabel('light') },
  { id: 'night' as BaseLayerId, label: baseLayerLabel('night') },
  { id: 'none' as BaseLayerId, label: baseLayerLabel('none') }
]
const cropLegend = cropStyles
const fieldForm = ref({
  id: '',
  name: 'Новое поле',
  crop: 'Пшеница',
  area: 80,
  agronomist: store.agronomistOptions[0] || 'Иван Петров',
  status: 'Активно',
  sowDate: '12.04.2026',
  yield: 6.5
})

const activeTasks = computed(() => store.tasks.filter((item) => item.status !== 'Выполнено').length)
const fieldSummary = computed(() => {
  const field = store.selectedField
  return `${field.crop}, ${field.area} га · ${field.status}`
})
const previewArea = computed(() => {
  if (drawPoints.value.length < 3) return 0
  return polygonAreaHectares(drawPoints.value)
})

const regionSuggestions = computed(() => {
  settlementsRevision.value
  return searchRegions(regionSearch.value, 20)
})

const settlementsLabel = computed(() => {
  settlementsRevision.value
  const stats = getSettlementsStats()
  if (!stats.loaded) return '12 000+'
  return stats.count.toLocaleString('ru-RU')
})

const fieldScouts = computed(() => store.scoutsForField(store.selectedField.id))

const arrivalLabel = computed(() => {
  const arrival = store.latestArrival(store.selectedField.id)
  if (!arrival) return ''
  const when = new Date(arrival.at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  return `${arrival.userName} на поле · ${when}`
})

const lastFieldOperation = computed(() => {
  const history = store.selectedField.history ?? []
  const last = history[history.length - 1]
  if (!last) return 'Нет записей'
  return `${last.type} · ${last.year}`
})

const spraySummary = computed(() => evaluateSprayWindow(store.weather))

const spraySummaryLabel = computed(() => {
  if (spraySummary.value.status === 'ok') return 'Можно опрыскивать'
  if (spraySummary.value.status === 'warn') return 'Осторожно — пограничные условия'
  return 'Не рекомендуется'
})

const spraySummaryClass = computed(() => {
  if (spraySummary.value.status === 'ok') return 'text-emerald-800'
  if (spraySummary.value.status === 'warn') return 'text-amber-800'
  return 'text-rose-800'
})

let regionBlurTimer = 0

function onRegionFocusIn() {
  window.clearTimeout(regionBlurTimer)
  showRegionSuggestions.value = regionSearch.value.trim().length >= 2
  void ensureSettlementsLoaded()
}

function onRegionFocusOut() {
  regionBlurTimer = window.setTimeout(() => {
    showRegionSuggestions.value = false
  }, 180)
}

function onRegionInput() {
  showRegionSuggestions.value = regionSearch.value.trim().length >= 2
  void ensureSettlementsLoaded()
}

watch(regionSearch, (value) => {
  const normalized = normalizeSearchText(value)
  if (normalized === 'тетрис' || normalized === 'tetris') {
    showTetris.value = true
    regionSearch.value = ''
    showRegionSuggestions.value = false
  }
})

function pickFirstSuggestion() {
  if (regionSuggestions.value[0]) pickRegion(regionSuggestions.value[0])
}

function pickRegion(region: MapRegion) {
  regionSearch.value = region.name
  showRegionSuggestions.value = false
  selectRegion(region.id)
}

function hideRegionSuggestionsLater() {
  regionBlurTimer = window.setTimeout(() => {
    showRegionSuggestions.value = false
  }, 180)
}

function selectRegion(id: string) {
  store.selectRegion(id)
  regionSearch.value = store.selectedRegion.name
  flyToSelectedRegion()
}

function onRegionChange(event: Event) {
  selectRegion((event.target as HTMLSelectElement).value)
}

function refreshMaps() {
  if (map.value) drawMapContent(map.value, fieldLayer, overlayLayer)
  if (fullscreenMapInstance.value) drawMapContent(fullscreenMapInstance.value, fullscreenFieldLayer, fullscreenOverlayLayer)
}

function applyBaseLayer(targetMap: L.Map, fullscreenMode: boolean) {
  const holder = fullscreenMode ? fullscreenBaseTile : mainBaseTile
  if (holder.value) {
    targetMap.removeLayer(holder.value)
    holder.value = null
  }
  const layer = createBaseLayer(store.effectiveMapBaseLayer)
  if (layer) {
    layer.addTo(targetMap)
    holder.value = layer
  }
}

function getFieldCrop(field: { id: string; crop: Crop }) {
  if (fieldPreview.value && fieldPreview.value.id === field.id) {
    return fieldPreview.value.crop as Crop
  }
  return field.crop
}

function createDrawHandleIcon(index: number) {
  return L.divIcon({
    className: 'leaflet-draw-handle',
    html: `<div class="draw-handle-dot">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })
}

function flyToSelectedRegion() {
  applyRegionToMap(map.value)
  applyRegionToMap(fullscreenMapInstance.value)
}

function applyRegionToMap(targetMap: L.Map | null) {
  if (!targetMap) return
  const region = store.selectedRegion
  targetMap.flyTo([region.lat, region.lng], region.zoom, { duration: 0.8 })
}

function layerButton(enabled: boolean) {
  return enabled
    ? 'rounded-3xl bg-[#8B6F47] px-3 py-2 text-xs font-semibold text-white'
    : 'rounded-3xl bg-white border border-[#E8DDCB] px-3 py-2 text-xs font-semibold text-[#5F4A2F]'
}

function sidebarLayerButton(enabled: boolean) {
  return enabled
    ? 'w-full rounded-3xl bg-[#8B6F47] px-4 py-3 text-left text-sm font-semibold text-white shadow-sm'
    : 'w-full rounded-3xl bg-white px-4 py-3 text-left text-sm font-semibold text-[#5F4A2F] shadow-sm'
}

function toolButton(active: boolean) {
  return active
    ? 'rounded-3xl bg-[#8B6F47] px-4 py-3 text-left text-sm font-semibold text-white shadow-sm'
    : 'rounded-3xl bg-white px-4 py-3 text-left text-sm text-[#5F4A2F] shadow-sm'
}

function startDrawing() {
  cancelDrawing()
  scoutingMode.value = false
  drawingMode.value = true
  measureMode.value = 'none'
  measureMessage.value = ''
  if (map.value) {
    map.value.getContainer().style.cursor = 'crosshair'
  }
}

function cancelDrawing() {
  drawingMode.value = false
  drawPoints.value = []
  drawHistory.value = []
  clearDrawPreview()
  if (map.value) {
    map.value.getContainer().style.cursor = ''
  }
}

function snapshotDrawState() {
  drawHistory.value.push(drawPoints.value.map((point) => [point[0], point[1]] as [number, number]))
  if (drawHistory.value.length > 48) {
    drawHistory.value.shift()
  }
}

function undoDrawAction() {
  if (drawHistory.value.length) {
    drawPoints.value = drawHistory.value.pop() ?? []
    updateDrawPreview()
    return
  }
  undoDrawPoint()
}

function undoDrawPoint() {
  snapshotDrawState()
  drawPoints.value.pop()
  updateDrawPreview()
}

function finishDrawing() {
  if (drawPoints.value.length < 3) return
  drawnCoordinates.value = [...drawPoints.value]
  drawingMode.value = false
  fieldForm.value = {
    id: '',
    name: `Новое поле ${store.fields.length + 1}`,
    crop: 'Пшеница',
    area: polygonAreaHectares(drawnCoordinates.value),
    agronomist: store.agronomistOptions[0] || 'Иван Петров',
    status: 'Активно',
    sowDate: '12.04.2026',
    yield: 6.3
  }
  editorMode.value = 'create'
  clearDrawPreview()
  if (map.value) {
    map.value.getContainer().style.cursor = ''
  }
  showFieldModal.value = true
}

function clearDrawPreview() {
  drawHandleMarkers.value.forEach((marker) => marker.remove())
  drawHandleMarkers.value = []
  drawLayer.value?.clearLayers()
  drawShapeLayer.value?.clearLayers()
}

function updateDrawShapesOnly() {
  if (!drawShapeLayer.value) return
  drawShapeLayer.value.clearLayers()
  if (drawPoints.value.length >= 2) {
    L.polyline(drawPoints.value, { color: '#8B6F47', weight: 3, dashArray: '8 6' }).addTo(drawShapeLayer.value)
  }
  if (drawPoints.value.length >= 3) {
    const style = resolveCropStyle(fieldForm.value.crop, store.showCropColors)
    L.polygon(drawPoints.value, {
      color: style.stroke,
      fillColor: style.fill,
      fillOpacity: 0.42,
      weight: 3
    }).addTo(drawShapeLayer.value)
  }
}

function syncDrawHandles() {
  if (!map.value) return
  if (!drawLayer.value) drawLayer.value = L.layerGroup().addTo(map.value)
  if (!drawShapeLayer.value) drawShapeLayer.value = L.layerGroup().addTo(map.value)

  drawHandleMarkers.value.forEach((marker) => marker.remove())
  drawHandleMarkers.value = []
  drawLayer.value.clearLayers()

  drawPoints.value.forEach((point, index) => {
    const marker = L.marker(point, {
      draggable: true,
      icon: createDrawHandleIcon(index)
    })
    marker.on('dragstart', () => {
      snapshotDrawState()
    })
    marker.on('drag', () => {
      const { lat, lng } = marker.getLatLng()
      drawPoints.value[index] = [lat, lng]
      updateDrawShapesOnly()
    })
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng()
      drawPoints.value[index] = [lat, lng]
      updateDrawShapesOnly()
    })
    marker.addTo(drawLayer.value as L.LayerGroup)
    drawHandleMarkers.value.push(marker)
  })

  updateDrawShapesOnly()
}

function updateDrawPreview() {
  syncDrawHandles()
}

function openEditField() {
  const selected = store.selectedField
  editorMode.value = 'edit'
  fieldPreview.value = { id: selected.id, crop: selected.crop }
  fieldForm.value = {
    id: selected.id,
    name: selected.name,
    crop: selected.crop,
    area: selected.area,
    agronomist: selected.agronomist,
    status: selected.status,
    sowDate: selected.sowDate,
    yield: selected.yield
  }
  showFieldModal.value = true
}

function closeFieldModal() {
  showFieldModal.value = false
  fieldPreview.value = null
  if (editorMode.value === 'create') {
    drawnCoordinates.value = null
  }
  refreshMaps()
}

function saveField() {
  fieldForm.value.area = parseRuDecimal(fieldForm.value.area)
  fieldForm.value.yield = parseRuDecimal(fieldForm.value.yield)

  if (editorMode.value === 'create') {
    store.addField(
      {
        name: fieldForm.value.name,
        crop: fieldForm.value.crop,
        area: fieldForm.value.area,
        agronomist: fieldForm.value.agronomist,
        status: fieldForm.value.status,
        sowDate: fieldForm.value.sowDate,
        yield: fieldForm.value.yield
      },
      drawnCoordinates.value ?? undefined
    )
    drawnCoordinates.value = null
  } else {
    store.updateField(fieldForm.value.id, {
      name: fieldForm.value.name,
      crop: fieldForm.value.crop as any,
      area: fieldForm.value.area,
      agronomist: fieldForm.value.agronomist,
      status: fieldForm.value.status as any,
      sowDate: fieldForm.value.sowDate,
      yield: fieldForm.value.yield
    })
  }
  showFieldModal.value = false
  fieldPreview.value = null
  refreshMaps()
}

function flyToFieldBounds(targetMap: L.Map | null, coordinates: [number, number][]) {
  if (!targetMap || !coordinates.length) return
  const bounds = L.latLngBounds(coordinates.map(([lat, lng]) => [lat, lng]))
  targetMap.flyToBounds(bounds, { padding: [48, 48], duration: 1.1, maxZoom: 15 })
}

function focusFieldOnMap() {
  const field = store.selectedField
  if (!field?.coordinates?.length) return
  flyToFieldBounds(map.value, field.coordinates)
  flyToFieldBounds(fullscreenMapInstance.value, field.coordinates)
  refreshMaps()
}

function viewSelectedField() {
  store.openFieldOnMap(store.selectedField.id)
}

function scoutKindLabel(kind: ScoutKind) {
  if (kind === 'weed') return 'Сорняк'
  if (kind === 'pest') return 'Вредитель'
  return 'Болезнь'
}

function scoutMarkerColor(kind: ScoutKind) {
  if (kind === 'weed') return '#2E7D32'
  if (kind === 'pest') return '#D97706'
  return '#C0392B'
}

function formatScoutDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function markArrival() {
  arrivalLoading.value = true
  await store.markFieldArrival(store.selectedField.id)
  arrivalLoading.value = false
}

function openRoute(provider: NavigationProvider) {
  const dest = fieldDestination(store.selectedField)
  if (!dest) {
    measureMessage.value = 'У поля нет контура — маршрут недоступен'
    return
  }
  openFieldNavigation(provider, dest.lat, dest.lng)
}

function toggleScoutingMode() {
  scoutingMode.value = !scoutingMode.value
  measureMode.value = 'none'
  measureMessage.value = ''
  if (scoutingMode.value) {
    cancelDrawing()
    measureMessage.value = 'Кликните на выбранном поле, чтобы поставить отметку обхода'
  } else {
    measureMessage.value = ''
  }
  if (map.value) {
    map.value.getContainer().style.cursor = scoutingMode.value ? 'crosshair' : ''
  }
}

function goToHistory() {
  router.push('/history')
}

function fitMapToField(targetMap: L.Map | null, coordinates: [number, number][]) {
  if (!targetMap || !coordinates.length) return
  const bounds = L.latLngBounds(coordinates.map(([lat, lng]) => [lat, lng]))
  targetMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
}

function drawMapContent(
  targetMap: L.Map,
  polygonLayer: { value: L.LayerGroup | null },
  extraLayer: { value: L.LayerGroup | null }
) {
  if (polygonLayer.value) {
    polygonLayer.value.clearLayers()
  } else {
    polygonLayer.value = L.layerGroup().addTo(targetMap)
  }

  if (extraLayer.value) {
    extraLayer.value.clearLayers()
  } else {
    extraLayer.value = L.layerGroup().addTo(targetMap)
  }

  const selectedId = store.selectedField.id
  const focusId = store.mapFocusFieldId
  const compactLabels = store.filteredFields.length > 30

  store.filteredFields.forEach((field) => {
    const isSelected = field.id === selectedId
    const isHighlighted = field.id === focusId
    const crop = getFieldCrop(field)
    const style = store.showNdviLayer ? ndviStyle(field.healthIndex) : resolveCropStyle(crop, store.showCropColors)
    const polygon = L.polygon(field.coordinates, {
      color: isHighlighted ? '#D97706' : isSelected ? '#2D5016' : style.stroke,
      fillColor: style.fill,
      fillOpacity: store.showNdviLayer ? 0.52 : isSelected ? 0.55 : store.showCropColors ? 0.38 : 0.22,
      weight: isHighlighted ? 5 : isSelected ? 4 : 2,
      opacity: isHighlighted ? 1 : isSelected ? 1 : 0.92,
      dashArray: isSelected && !isHighlighted ? '10 6' : undefined,
      className: isHighlighted ? 'field-pulse-highlight' : undefined
    })
    polygon.on('click', () => {
      if (!drawingMode.value && measureMode.value === 'none') {
        store.selectField(field.id)
      }
    })
    polygon.bindTooltip(
      store.showNdviLayer
        ? `#${field.number} · NDVI ${field.healthIndex}`
        : `#${field.number} · ${crop}`,
      {
        permanent: !compactLabels,
        direction: 'center',
        className: 'field-tooltip'
      }
    )
    if (isSelected) {
      polygon.bringToFront()
    }
    polygon.addTo(polygonLayer.value as L.LayerGroup)

    if (store.showYieldLayer) {
      const center = polygonCenter(field.coordinates)
      L.circleMarker(center, {
        radius: 0,
        opacity: 0,
        fillOpacity: 0
      })
        .bindTooltip(`${field.yield} т/га`, { direction: 'top', offset: [0, -8] })
        .addTo(extraLayer.value as L.LayerGroup)
    }
  })

  if (store.showTasksLayer) {
    const active = store.tasks.filter((task) => task.status !== 'Выполнено')
    const tasksByField = new Map<string, typeof active>()
    active.forEach((task) => {
      const list = tasksByField.get(task.fieldId) ?? []
      list.push(task)
      tasksByField.set(task.fieldId, list)
    })

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 56,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 14,
      chunkedLoading: true
    })

    tasksByField.forEach((tasks, fieldId) => {
      const field = store.fields.find((item) => item.id === fieldId)
      if (!field) return
      const center = polygonCenter(field.coordinates)
      const count = tasks.length
      const marker = L.marker([center[0] + 0.0015, center[1] - 0.0015], {
        icon: L.divIcon({
          className: 'task-cluster-marker',
          html:
            count > 1
              ? `<span class="task-cluster-badge">${count}</span>`
              : `<span class="task-cluster-dot"></span>`,
          iconSize: count > 1 ? [30, 30] : [18, 18],
          iconAnchor: count > 1 ? [15, 15] : [9, 9]
        })
      })

      const popup = document.createElement('div')
      popup.className = 'task-popup text-sm text-[#342d1e]'
      if (count > 1) {
        const heading = document.createElement('p')
        heading.className = 'font-semibold'
        heading.textContent = `+${count} задач на поле «${field.name}»`
        popup.append(heading)
      }

      tasks.forEach((task) => {
        const block = document.createElement('div')
        block.className = count > 1 ? 'mt-3 rounded-2xl border border-[#E8DDCB] bg-[#F5F1E8] p-3' : ''
        block.innerHTML = `
          <p class="font-semibold">${task.type}</p>
          <p class="mt-1 text-xs text-[#5F4A2F]">${task.fieldName}</p>
          <p class="mt-1 text-xs">${task.date} · ${task.priority}</p>
          <p class="mt-1 text-xs">Исполнитель: ${task.assignee}</p>
        `

        const actions = document.createElement('div')
        actions.className = 'mt-3 flex flex-wrap gap-2'

        const goBtn = document.createElement('button')
        goBtn.type = 'button'
        goBtn.className = 'rounded-2xl bg-[#B89B72] px-3 py-1.5 text-xs font-semibold text-white'
        goBtn.textContent = 'На карте'
        goBtn.addEventListener('click', () => {
          store.openFieldOnMap(task.fieldId)
          fieldPreview.value = { id: field.id, crop: field.crop }
          marker.closePopup()
        })

        const doneBtn = document.createElement('button')
        doneBtn.type = 'button'
        doneBtn.className = 'rounded-2xl border border-[#6FCF97] px-3 py-1.5 text-xs font-semibold text-[#3A5A24]'
        doneBtn.textContent = 'Выполнено'
        doneBtn.addEventListener('click', async () => {
          await store.completeTask(task.id)
          marker.closePopup()
          refreshMaps()
        })

        actions.append(goBtn)
        if (store.can('tasks.complete')) {
          actions.append(doneBtn)
        }
        block.append(actions)
        popup.append(block)
      })

      marker.bindPopup(popup, { maxWidth: 280, className: 'task-marker-popup' })
      clusterGroup.addLayer(marker)
    })

    extraLayer.value.addLayer(clusterGroup)
  }

  if (store.showScoutingLayer) {
    store.scoutReports.forEach((scout) => {
      const color = scoutMarkerColor(scout.kind)
      L.circleMarker([scout.lat, scout.lng], {
        radius: 8,
        color: '#ffffff',
        fillColor: color,
        fillOpacity: 0.95,
        weight: 2
      })
        .bindPopup(
          `<div class="text-sm"><strong>${scoutKindLabel(scout.kind)}</strong><br/>${scout.fieldName}<br/>${scout.comment}</div>`,
          { maxWidth: 240 }
        )
        .addTo(extraLayer.value as L.LayerGroup)
    })
  }

  if (store.showEquipmentLayer) {
    store.equipment.forEach((item, index) => {
      const field = store.fields[index % store.fields.length]
      const center = polygonCenter(field.coordinates)
      L.circleMarker([center[0] - 0.0015, center[1] + 0.0015], {
        radius: 6,
        color: '#3A5A24',
        fillColor: '#6FCF97',
        fillOpacity: 0.95,
        weight: 2
      })
        .bindTooltip(`${item.name} · ${item.type}`)
        .addTo(extraLayer.value as L.LayerGroup)
    })
  }

  if (drawnCoordinates.value && showFieldModal.value && editorMode.value === 'create') {
    const style = resolveCropStyle(fieldForm.value.crop, store.showCropColors)
    L.polygon(drawnCoordinates.value, {
      color: style.stroke,
      fillColor: style.fill,
      fillOpacity: 0.48,
      weight: 3,
      dashArray: '6 5'
    })
      .bindTooltip(`Новое поле · ${fieldForm.value.crop}`, { direction: 'center', className: 'field-tooltip' })
      .addTo(polygonLayer.value as L.LayerGroup)
  }
}

function handleMapClick(event: L.LeafletMouseEvent, targetMap: L.Map, measureGroup: { value: L.LayerGroup | null }) {
  if (scoutingMode.value) {
    const field = store.selectedField
    const clickPoint: [number, number] = [event.latlng.lat, event.latlng.lng]
    if (!pointInPolygon(clickPoint, field.coordinates)) {
      measureMessage.value = 'Отметку обхода ставьте внутри контура выбранного поля'
      return
    }
    scoutDraft.value = {
      fieldId: field.id,
      fieldName: field.name,
      lat: clickPoint[0],
      lng: clickPoint[1]
    }
    scoutingMode.value = false
    measureMessage.value = ''
    if (targetMap.getContainer()) targetMap.getContainer().style.cursor = ''
    return
  }

  if (drawingMode.value) {
    snapshotDrawState()
    drawPoints.value.push([event.latlng.lat, event.latlng.lng])
    updateDrawPreview()
    return
  }

  if (measureMode.value === 'none') return

  measurePoints.value.push([event.latlng.lat, event.latlng.lng])
  if (!measureGroup.value) {
    measureGroup.value = L.layerGroup().addTo(targetMap)
  }
  measureGroup.value.clearLayers()

  measurePoints.value.forEach((point) => {
    L.circleMarker(point, { radius: 5, color: '#342d1e', fillColor: '#B89B72', fillOpacity: 1 }).addTo(measureGroup.value as L.LayerGroup)
  })

  if (measureMode.value === 'area' && measurePoints.value.length >= 3) {
    L.polygon(measurePoints.value, { color: '#8B6F47', fillColor: '#F2C94C', fillOpacity: 0.25, weight: 2 }).addTo(measureGroup.value as L.LayerGroup)
    const area = polygonAreaHectares(measurePoints.value)
    measureMessage.value = `Площадь: ${area} га`
  }

  if (measureMode.value === 'distance' && measurePoints.value.length >= 2) {
    L.polyline(measurePoints.value, { color: '#8B6F47', weight: 3 }).addTo(measureGroup.value as L.LayerGroup)
    let total = 0
    for (let i = 1; i < measurePoints.value.length; i++) {
      total += haversineDistance(measurePoints.value[i - 1], measurePoints.value[i])
    }
    measureMessage.value = `Расстояние: ${(total / 1000).toFixed(2)} км`
  }
}

function initializeMap() {
  if (!mapContainer.value) return
  const region = store.selectedRegion
  map.value = L.map(mapContainer.value, {
    center: [region.lat, region.lng],
    zoom: region.zoom,
    zoomControl: true,
    scrollWheelZoom: true
  })
  applyBaseLayer(map.value, false)
  map.value.on('click', (event) => handleMapClick(event, map.value as L.Map, measureLayer))
  drawMapContent(map.value, fieldLayer, overlayLayer)
}

function destroyFullscreenMap() {
  if (fullscreenMapInstance.value) {
    fullscreenMapInstance.value.remove()
    fullscreenMapInstance.value = null
  }
  fullscreenFieldLayer.value = null
  fullscreenOverlayLayer.value = null
  fullscreenMeasureLayer.value = null
  if (fullscreenMap.value) {
    fullscreenMap.value.innerHTML = ''
  }
}

function initializeFullscreenMap() {
  if (!fullscreenMap.value) return
  destroyFullscreenMap()
  const region = store.selectedRegion
  fullscreenMapInstance.value = L.map(fullscreenMap.value, {
    center: [region.lat, region.lng],
    zoom: region.zoom,
    zoomControl: true
  })
  applyBaseLayer(fullscreenMapInstance.value, true)
  fullscreenMapInstance.value.on('click', (event) =>
    handleMapClick(event, fullscreenMapInstance.value as L.Map, fullscreenMeasureLayer)
  )
  drawMapContent(fullscreenMapInstance.value, fullscreenFieldLayer, fullscreenOverlayLayer)
  nextTick(() => fullscreenMapInstance.value?.invalidateSize())
}

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value
  if (fullscreen.value) {
    nextTick(() => initializeFullscreenMap())
  } else {
    destroyFullscreenMap()
    measureMode.value = 'none'
    measurePoints.value = []
    measureMessage.value = ''
  }
}

function zoomMap(delta: number) {
  const target = fullscreenMapInstance.value ?? map.value
  if (!target) return
  if (delta > 0) target.zoomIn()
  else target.zoomOut()
}

function startMeasureArea() {
  measureMode.value = measureMode.value === 'area' ? 'none' : 'area'
  measurePoints.value = []
  measureMessage.value = measureMode.value === 'area' ? 'Кликните по карте, чтобы обвести область (минимум 3 точки)' : ''
  measureLayer.value?.clearLayers()
  fullscreenMeasureLayer.value?.clearLayers()
}

function startMeasureDistance() {
  measureMode.value = measureMode.value === 'distance' ? 'none' : 'distance'
  measurePoints.value = []
  measureMessage.value = measureMode.value === 'distance' ? 'Кликните две или более точек для измерения расстояния' : ''
  measureLayer.value?.clearLayers()
  fullscreenMeasureLayer.value?.clearLayers()
}

function resetMeasure() {
  measureMode.value = 'none'
  measurePoints.value = []
  measureMessage.value = ''
  measureLayer.value?.clearLayers()
  fullscreenMeasureLayer.value?.clearLayers()
}

onMounted(async () => {
  regionSearch.value = store.selectedRegion.name
  await ensureSettlementsLoaded()
  initializeMap()
  store.loadWeather()
  if (store.mapFocusToken > 0) {
    await nextTick()
    focusFieldOnMap()
  }
})

watch(
  () => store.selectedRegionId,
  () => {
    flyToSelectedRegion()
  }
)

watch(
  () => store.effectiveMapBaseLayer,
  () => {
    if (map.value) applyBaseLayer(map.value, false)
    if (fullscreenMapInstance.value) applyBaseLayer(fullscreenMapInstance.value, true)
  }
)

watch(
  () => [store.showCropColors, fieldForm.value.crop, showFieldModal.value, editorMode.value],
  () => {
    if (showFieldModal.value && editorMode.value === 'edit') {
      fieldPreview.value = { id: fieldForm.value.id, crop: fieldForm.value.crop }
    }
    if (drawingMode.value) updateDrawShapesOnly()
    refreshMaps()
  }
)

watch(
  () => store.fields.map((field) => `${field.id}:${field.crop}:${field.status}`).join('|'),
  () => refreshMaps()
)

watch(scoutDraft, (value, previous) => {
  if (!value && previous) refreshMaps()
})

watch(
  () => store.mapFocusToken,
  async () => {
    if (store.mapFocusToken > 0) {
      await nextTick()
      focusFieldOnMap()
    }
  }
)

watch(
  () => [
    store.filteredFields.map((field) => field.id).join(','),
    store.selectedField.id,
    store.mapFocusFieldId,
    store.showTasksLayer,
    store.showEquipmentLayer,
    store.showYieldLayer,
    store.showNdviLayer,
    store.showScoutingLayer,
    store.scoutReports.length
  ],
  () => {
    if (map.value) {
      drawMapContent(map.value, fieldLayer, overlayLayer)
    }
    if (fullscreenMapInstance.value) {
      drawMapContent(fullscreenMapInstance.value, fullscreenFieldLayer, fullscreenOverlayLayer)
    }
  }
)
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    DetailRow: {
      props: ['label', 'value'],
      template: '<div class="flex items-center justify-between text-sm text-[#5F4A2F]"><span>{{ label }}</span><span class="font-semibold text-[#342d1e]">{{ value }}</span></div>'
    },
    StatCard: {
      props: ['title', 'value'],
      template: '<div class="rounded-3xl bg-white p-5 shadow-sm"><p class="text-sm text-[#5F4A2F]/80">{{ title }}</p><p class="mt-3 text-2xl font-semibold text-[#342d1e]">{{ value }}</p></div>'
    }
  }
})
</script>
