<template>
  <main class="preview-shell">
    <div class="preview-notice">
      <span class="notice-dot"></span>
      СТАТИЧЕСКОЕ ДЕМО · ВСЕ ПОКАЗАТЕЛИ ВЫМЫШЛЕНЫ
    </div>

    <header class="preview-header">
      <a class="brand" href="#" aria-label="Agro SaaS">
        <span class="brand-mark">А</span>
        <span>agro<span class="brand-light">flow</span></span>
      </a>
      <nav aria-label="Разделы демонстрации">
        <span class="nav-item active">Обзор</span>
        <span class="nav-item">Поля</span>
        <span class="nav-item">План работ</span>
        <span class="nav-item">Аналитика</span>
      </nav>
      <span class="season-pill"><span></span> Сезон 2026</span>
    </header>

    <section class="intro">
      <div>
        <p class="eyebrow">ПОНЕДЕЛЬНИК, 18 МАЯ 2026</p>
        <h1>Доброе утро, Алексей <span>✳</span></h1>
        <p class="intro-copy">Сводка по хозяйству «Северное» за сегодня.</p>
      </div>
      <div class="demo-label">Учебный пример · не реальные данные</div>
    </section>

    <section class="stats-grid" aria-label="Демонстрационные показатели">
      <article class="stat-card">
        <div class="stat-heading"><span>Площадь в работе</span><span class="stat-icon green">⌁</span></div>
        <strong>1 284 <small>га</small></strong>
        <div class="stat-foot"><span class="positive">↗ 8,4%</span> к прошлому сезону</div>
      </article>
      <article class="stat-card">
        <div class="stat-heading"><span>Поля</span><span class="stat-icon sand">▦</span></div>
        <strong>12 <small>участков</small></strong>
        <div class="stat-foot"><span>9 в норме</span><span class="separator">·</span><span class="warning">3 требуют внимания</span></div>
      </article>
      <article class="stat-card">
        <div class="stat-heading"><span>План на сегодня</span><span class="stat-icon blue">◷</span></div>
        <strong>7 <small>операций</small></strong>
        <div class="stat-foot"><span>4 выполнено</span><span class="separator">·</span><span>3 впереди</span></div>
      </article>
      <article class="stat-card">
        <div class="stat-heading"><span>Средняя влажность</span><span class="stat-icon cyan">≈</span></div>
        <strong>64<small>%</small></strong>
        <div class="stat-foot"><span class="positive">Подходит для посева</span></div>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel field-panel">
        <div class="panel-heading">
          <div><p class="eyebrow">МОНИТОРИНГ</p><h2>Поля хозяйства</h2></div>
          <span class="muted">Схема условная</span>
        </div>
        <div class="field-map" role="img" aria-label="Условная схема демонстрационных полей">
          <div class="map-grid"></div>
          <svg viewBox="0 0 640 310" aria-hidden="true">
            <path class="field field-one" d="M37 69 190 34 218 129 65 159Z"/>
            <path class="field field-two" d="m225 28 156 14-9 99-150-5Z"/>
            <path class="field field-three" d="m402 48 178 23-25 113-176-36Z"/>
            <path class="field field-four" d="m70 178 156-33 10 112-141 30Z"/>
            <path class="field field-five" d="m254 151 132 2-13 102-122 5Z"/>
            <path class="field field-six" d="m402 165 154 30-28 79-137-17Z"/>
            <text x="97" y="106">СЕВЕР-01</text><text x="274" y="86">СЕВЕР-02</text>
            <text x="442" y="116">ЛУГОВОЕ</text><text x="109" y="237">РЕЧНОЕ</text>
            <text x="286" y="210">ЦЕНТР-04</text><text x="432" y="235">ВОСТОК</text>
          </svg>
          <div class="map-legend"><span><i class="legend-good"></i> В норме</span><span><i class="legend-watch"></i> Наблюдение</span></div>
        </div>
        <div class="field-summary"><span><b>12</b> участков</span><span><b>1 284 га</b> общая площадь</span><span><b>Пшеница</b> основной профиль</span></div>
      </article>

      <article class="panel weather-panel">
        <div class="panel-heading"><div><p class="eyebrow">ПОГОДА</p><h2>Условия на поле</h2></div><span class="weather-icon">☀</span></div>
        <div class="weather-place">Северный район <span>·</span> демонстрационный прогноз</div>
        <div class="temperature">+18<span>°</span><small>Ясно</small></div>
        <div class="weather-details">
          <div><span>Ветер</span><b>3,2 м/с · СЗ</b></div>
          <div><span>Влажность</span><b>64%</b></div>
          <div><span>Осадки</span><b>0 мм</b></div>
        </div>
        <div class="weather-recommendation"><span>✦</span><p><b>Условия благоприятные</b><br>Это пример рекомендации для макета. Прогноз не подключён.</p></div>
      </article>
    </section>

    <section class="content-grid lower-grid">
      <article class="panel tasks-panel">
        <div class="panel-heading"><div><p class="eyebrow">РАСПИСАНИЕ</p><h2>План работ</h2></div><span class="muted">18 мая</span></div>
        <div class="task-row"><span class="task-time">08:00</span><span class="task-status done">✓</span><div><b>Осмотр посевов</b><small>Поле Север-01 · Иван Петров</small></div><span class="task-state">Выполнено</span></div>
        <div class="task-row"><span class="task-time">10:30</span><span class="task-status in-progress">◌</span><div><b>Подкормка озимой пшеницы</b><small>Поле Север-02 · Трактор МТЗ-82</small></div><span class="task-state active-state">В работе</span></div>
        <div class="task-row"><span class="task-time">14:00</span><span class="task-status planned">·</span><div><b>Проверка оросительной системы</b><small>Поле Луговое · Сергей Волков</small></div><span class="task-state">Запланировано</span></div>
      </article>
      <article class="panel harvest-panel">
        <div class="panel-heading"><div><p class="eyebrow">СЕЗОН 2026</p><h2>Структура посевов</h2></div><span class="muted">1 284 га</span></div>
        <div class="crop-line"><div><span class="crop-dot wheat"></span>Озимая пшеница</div><b>548 га</b><span>43%</span></div>
        <div class="crop-track"><i style="width:43%"></i></div>
        <div class="crop-line"><div><span class="crop-dot barley"></span>Ячмень</div><b>385 га</b><span>30%</span></div>
        <div class="crop-track barley-track"><i style="width:30%"></i></div>
        <div class="crop-line"><div><span class="crop-dot sunflower"></span>Подсолнечник</div><b>231 га</b><span>18%</span></div>
        <div class="crop-track sun-track"><i style="width:18%"></i></div>
        <div class="crop-line"><div><span class="crop-dot other"></span>Другие культуры</div><b>120 га</b><span>9%</span></div>
        <div class="crop-track other-track"><i style="width:9%"></i></div>
      </article>
    </section>
    <footer>AgroFlow · статический макет для портфолио · данные полностью вымышлены</footer>
  </main>
</template>
