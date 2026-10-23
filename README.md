# Agro SaaS

Панель управления сельскохозяйственными операциями: карта полей, погодные данные, планирование работ и аналитика в одном интерфейсе.

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-42B883?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-API-444444?logo=express&logoColor=white" alt="Express API" />
  <img src="https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

## Возможности

- Работа с полями, картой и пространственными слоями.
- Календарь полевых операций и история работ.
- Погодные данные и рекомендации по агрооперациям.
- Импорт, экспорт и печатные отчёты.
- Отдельный Express API и PostgreSQL для серверной части.

## Стек

Vue 3, TypeScript, Vite, Pinia, Vue Router, Leaflet, Express, PostgreSQL.

## Запуск для разработки

Требуются Node.js и PostgreSQL. Сначала проверьте example-конфиги и замените все значения секретов локальными credentials; не используйте значения из репозитория.

```bash
npm install
npm run dev:server
```

В отдельном терминале запустите клиент:

```bash
npm run dev
```

Сборка клиента и сервера:

```bash
npm run build
npm run build:server
```

Подробная схема переменных окружения и миграций будет добавлена после очистки конфигурационных примеров.

## Структура

- `src/` — клиентское приложение, экраны, карта и компоненты.
- `server/` — API, доступ к базе данных и серверные сервисы.
- `deploy/` — материалы для развертывания.
- `scripts/` — вспомогательные утилиты и данные для генерации.

## Статус

Проект находится в разработке. Перед production-развертыванием настройте секреты, базу данных и внешние API-ключи в своем окружении.