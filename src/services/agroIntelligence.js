import { defaultRiskRules } from '@/data/mockData';
function rulesFrom(ctx) {
    return { ...defaultRiskRules, ...ctx.riskRules };
}
function riskColor(level) {
    if (level === 'high')
        return 'bg-rose-100 text-rose-700';
    if (level === 'medium')
        return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
}
function riskLabel(level) {
    if (level === 'high')
        return 'Высокий';
    if (level === 'medium')
        return 'Средний';
    return 'Низкий';
}
function parseMetric(value) {
    const match = value.match(/-?\d+(?:\.\d+)?/);
    return match ? Number.parseFloat(match[0]) : Number.NaN;
}
function metricsFromWeather(weather) {
    const fallback = {
        temperature: 18,
        humidity: 62,
        pressure: 1014,
        windSpeed: 6,
        precipitation: 0.8,
        tomorrowRain: 2,
        weekRain: 12,
        minTempTomorrow: 10,
        maxTempTomorrow: 20
    };
    if (weather.metrics)
        return weather.metrics;
    const temp = parseMetric(weather.temperature);
    const humidity = parseMetric(weather.humidity);
    const windSpeed = parseMetric(weather.wind);
    const tomorrowRain = parseMetric(weather.forecast[1]?.rain ?? '0');
    const weekRain = weather.forecast.reduce((sum, day) => sum + parseMetric(day.rain), 0);
    const minTempTomorrow = weather.forecast[1]?.minTemp ?? temp;
    const maxTempTomorrow = weather.forecast[1]?.maxTemp ?? temp;
    return {
        ...fallback,
        temperature: Number.isFinite(temp) ? temp : fallback.temperature,
        humidity: Number.isFinite(humidity) ? humidity : fallback.humidity,
        windSpeed: Number.isFinite(windSpeed) ? windSpeed : fallback.windSpeed,
        tomorrowRain: Number.isFinite(tomorrowRain) ? tomorrowRain : fallback.tomorrowRain,
        weekRain: Number.isFinite(weekRain) ? weekRain : fallback.weekRain,
        minTempTomorrow: Number.isFinite(minTempTomorrow) ? minTempTomorrow : fallback.minTempTomorrow,
        maxTempTomorrow: Number.isFinite(maxTempTomorrow) ? maxTempTomorrow : fallback.maxTempTomorrow
    };
}
export function buildRecommendations(ctx) {
    const metrics = metricsFromWeather(ctx.weather);
    const field = ctx.selectedField;
    const rules = rulesFrom(ctx);
    const items = [];
    if (metrics.tomorrowRain >= rules.rainDangerMm) {
        items.push({
            id: 'rain-delay',
            icon: 'alertTriangle',
            text: `Завтра ожидается ${metrics.tomorrowRain.toFixed(1)} мм осадков в ${ctx.regionName} — перенесите опрыскивание и внесение удобрений.`
        });
    }
    else if (metrics.temperature >= 8 && metrics.temperature <= 26 && metrics.windSpeed <= rules.windMaxMs && metrics.tomorrowRain < rules.rainWarningMm) {
        items.push({
            id: 'good-work',
            icon: 'check',
            text: `Благоприятные условия для полевых работ на поле «${field.name}».`
        });
    }
    if (field.humidity < rules.soilHumidityLow) {
        items.push({
            id: 'soil-dry',
            icon: 'alertTriangle',
            text: `Поле №${field.number}: влажность почвы ${field.humidity}% — рекомендуется контроль полива (порог ${rules.soilHumidityLow}%).`
        });
    }
    else if (field.humidity > rules.soilHumidityHigh) {
        items.push({
            id: 'soil-wet',
            icon: 'info',
            text: `Поле №${field.number}: повышенная влажность почвы (${field.humidity}%) — отложите обработку до подсыхания (порог ${rules.soilHumidityHigh}%).`
        });
    }
    if (metrics.humidity > 72 && metrics.temperature > 14 && metrics.weekRain > rules.rainWarningMm) {
        items.push({
            id: 'fungus-risk',
            icon: 'alertTriangle',
            text: `На культуре «${field.crop}» повышен риск грибковых заболеваний из-за влажности ${Math.round(metrics.humidity)}%.`
        });
    }
    if (metrics.minTempTomorrow <= rules.frostTempC) {
        items.push({
            id: 'frost',
            icon: 'alertTriangle',
            text: `Риск заморозков: завтра минимум ${Math.round(metrics.minTempTomorrow)}°C — защитите всходы на поле №${field.number}.`
        });
    }
    const urgentTasks = ctx.tasks.filter((task) => task.status !== 'Выполнено' && task.priority === 'Высокий').length;
    if (urgentTasks > 0) {
        items.push({
            id: 'urgent-tasks',
            icon: 'info',
            text: `Есть ${urgentTasks} срочных заданий — проверьте раздел «Задания».`
        });
    }
    if (field.status === 'Внимание') {
        items.push({
            id: 'field-attention',
            icon: 'alertTriangle',
            text: `Поле №${field.number} в статусе «Внимание» — нужен осмотр агронома ${field.agronomist}.`
        });
    }
    if (metrics.windSpeed > rules.windMaxMs) {
        items.push({
            id: 'wind',
            icon: 'slash',
            text: `Сильный ветер ${Math.round(metrics.windSpeed)} м/с — не рекомендуется опрыскивание (порог ${rules.windMaxMs} м/с).`
        });
    }
    if (field.healthIndex >= 80 && metrics.temperature >= 12) {
        items.push({
            id: 'harvest-ready',
            icon: 'check',
            text: `Индекс здоровья поля ${field.healthIndex}/100 — можно планировать уборку ${field.crop.toLowerCase()}.`
        });
    }
    if (!items.length) {
        items.push({
            id: 'stable',
            icon: 'check',
            text: 'Агроклиматические условия стабильные — следуйте текущему плану работ.'
        });
    }
    return items.slice(0, 5);
}
export function buildRiskIndexes(ctx) {
    const metrics = metricsFromWeather(ctx.weather);
    const field = ctx.selectedField;
    const rules = rulesFrom(ctx);
    const droughtScore = (field.humidity < rules.soilHumidityLow ? 2 : 0) +
        (metrics.weekRain < 5 ? 2 : metrics.weekRain < 12 ? 1 : 0) +
        (metrics.temperature > 28 ? 1 : 0);
    const moistureScore = (metrics.humidity > 75 ? 2 : metrics.humidity > 65 ? 1 : 0) +
        (metrics.weekRain > rules.weekRainHigh ? 2 : metrics.weekRain > 12 ? 1 : 0) +
        (field.humidity > rules.soilHumidityHigh - 2 ? 1 : 0);
    const frostScore = metrics.minTempTomorrow <= rules.frostTempC - 2
        ? 3
        : metrics.minTempTomorrow <= rules.frostTempC
            ? 2
            : metrics.minTempTomorrow <= rules.frostTempC + 3
                ? 1
                : 0;
    const diseaseScore = (metrics.humidity > 70 ? 2 : metrics.humidity > 60 ? 1 : 0) +
        (metrics.weekRain > 10 ? 1 : 0) +
        (field.healthIndex < 75 ? 1 : 0) +
        (field.status === 'Внимание' ? 1 : 0);
    function toLevel(score) {
        if (score >= 3)
            return 'high';
        if (score >= 2)
            return 'medium';
        return 'low';
    }
    const drought = toLevel(droughtScore);
    const moisture = toLevel(moistureScore);
    const frost = toLevel(frostScore);
    const disease = toLevel(diseaseScore);
    return [
        {
            id: 'drought',
            title: 'Риск засухи',
            value: riskLabel(drought),
            level: drought,
            color: riskColor(drought),
            hint: `Осадки за 7 дней: ${metrics.weekRain.toFixed(1)} мм, влажность почвы: ${field.humidity}%`
        },
        {
            id: 'moisture',
            title: 'Риск переувлажнения',
            value: riskLabel(moisture),
            level: moisture,
            color: riskColor(moisture),
            hint: `Влажность воздуха ${Math.round(metrics.humidity)}%, осадки за неделю ${metrics.weekRain.toFixed(1)} мм`
        },
        {
            id: 'frost',
            title: 'Риск заморозков',
            value: riskLabel(frost),
            level: frost,
            color: riskColor(frost),
            hint: `Минимум завтра: ${Math.round(metrics.minTempTomorrow)}°C`
        },
        {
            id: 'disease',
            title: 'Риск заболеваний',
            value: riskLabel(disease),
            level: disease,
            color: riskColor(disease),
            hint: `Культура ${field.crop}, индекс здоровья ${field.healthIndex}/100`
        }
    ];
}
export function buildNotifications(ctx) {
    const metrics = metricsFromWeather(ctx.weather);
    const rules = rulesFrom(ctx);
    const alerts = [];
    if (metrics.tomorrowRain >= rules.rainDangerMm) {
        alerts.push({
            id: 'weather-heavy-rain',
            title: 'Сильные осадки завтра',
            description: `В ${ctx.regionName} ожидается ${metrics.tomorrowRain.toFixed(1)} мм дождя — отложите полевые работы.`,
            severity: 'danger',
            type: 'weather',
            actionPath: '/fields'
        });
    }
    else if (metrics.tomorrowRain >= rules.rainWarningMm) {
        alerts.push({
            id: 'weather-rain',
            title: 'Завтра ожидается дождь',
            description: `${ctx.regionName}: ${metrics.tomorrowRain.toFixed(1)} мм — проверьте график опрыскивания (порог ${rules.rainWarningMm} мм).`,
            severity: 'warning',
            type: 'weather',
            actionPath: '/fields'
        });
    }
    if (metrics.minTempTomorrow <= rules.frostTempC) {
        alerts.push({
            id: 'weather-frost',
            title: 'Предупреждение о заморозках',
            description: `Минимальная температура завтра ${Math.round(metrics.minTempTomorrow)}°C — защитите чувствительные культуры.`,
            severity: 'danger',
            type: 'weather',
            actionPath: '/fields'
        });
    }
    if (metrics.windSpeed > rules.windMaxMs) {
        alerts.push({
            id: 'weather-wind',
            title: 'Сильный ветер',
            description: `Скорость ветра ${Math.round(metrics.windSpeed)} м/с — опасно для опрыскивания (порог ${rules.windMaxMs} м/с).`,
            severity: 'warning',
            type: 'weather',
            actionPath: '/fields'
        });
    }
    ctx.fields
        .filter((field) => field.status === 'Внимание')
        .slice(0, 3)
        .forEach((field) => {
        alerts.push({
            id: `field-${field.id}`,
            title: `Поле №${field.number} требует внимания`,
            description: `${field.name}: ${field.crop}, влажность ${field.humidity}%, агроном ${field.agronomist}.`,
            severity: 'warning',
            type: 'field',
            actionPath: '/fields'
        });
    });
    ctx.tasks
        .filter((task) => task.status === 'Запланировано' && task.priority === 'Высокий')
        .slice(0, 3)
        .forEach((task) => {
        alerts.push({
            id: `task-${task.id}`,
            title: 'Срочное задание',
            description: `${task.type} на ${task.fieldName}, исполнитель ${task.assignee}, дата ${task.date}.`,
            severity: 'warning',
            type: 'task',
            actionPath: '/tasks'
        });
    });
    ctx.tasks
        .filter((task) => task.status === 'В работе')
        .slice(0, 2)
        .forEach((task) => {
        alerts.push({
            id: `active-${task.id}`,
            title: 'Задание в работе',
            description: `${task.type} на ${task.fieldName} — контролируйте выполнение до ${task.date}.`,
            severity: 'info',
            type: 'task',
            actionPath: '/tasks'
        });
    });
    ctx.equipment
        .filter((item) => item.status === 'На обслуживании')
        .slice(0, 2)
        .forEach((item) => {
        alerts.push({
            id: `equip-${item.id}`,
            title: 'Техника на обслуживании',
            description: `${item.name} (${item.number}) — следующее ТО ${item.nextService}.`,
            severity: 'info',
            type: 'equipment',
            actionPath: '/equipment'
        });
    });
    const lowHealthFields = ctx.fields.filter((field) => field.healthIndex < 70).length;
    if (lowHealthFields > 0) {
        alerts.push({
            id: 'health-alert',
            title: 'Поля с низким индексом здоровья',
            description: `${lowHealthFields} полей с индексом ниже 70 — рекомендуется диагностика.`,
            severity: 'warning',
            type: 'field',
            actionPath: '/analytics'
        });
    }
    return alerts.slice(0, 12);
}
//# sourceMappingURL=agroIntelligence.js.map