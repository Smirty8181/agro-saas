function parseWindMs(windLabel, metricsWind) {
    if (Number.isFinite(metricsWind))
        return metricsWind;
    const match = windLabel.match(/([\d.]+)/);
    return match ? Number.parseFloat(match[0]) : 0;
}
export function evaluateSprayWindow(weather) {
    const metrics = weather.metrics;
    const wind = parseWindMs(weather.wind, metrics?.windSpeed);
    const humidity = metrics?.humidity ?? 60;
    const precip = metrics?.precipitation ?? 0;
    const tomorrowRain = metrics?.tomorrowRain ?? 0;
    const factors = [
        {
            name: 'Ветер',
            value: `${wind.toFixed(1)} м/с`,
            ok: wind <= 4
        },
        {
            name: 'Влажность',
            value: `${Math.round(humidity)}%`,
            ok: humidity >= 40 && humidity <= 88
        },
        {
            name: 'Осадки сейчас',
            value: `${precip.toFixed(1)} мм`,
            ok: precip < 0.3
        },
        {
            name: 'Дождь завтра',
            value: `${tomorrowRain.toFixed(1)} мм`,
            ok: tomorrowRain < 2
        }
    ];
    const badCount = factors.filter((item) => !item.ok).length;
    const windBad = wind > 6;
    const windWarn = wind > 4 && wind <= 6;
    if (windBad || badCount >= 3) {
        return {
            status: 'bad',
            title: 'Опрыскивание не рекомендуется',
            hint: 'Дождитесь спокойного ветра и сухой погоды. Перенесите работу на ближайшее окно.',
            factors
        };
    }
    if (windWarn || badCount >= 1) {
        return {
            status: 'warn',
            title: 'Осторожно — пограничные условия',
            hint: 'Возможен перенос капель. Согласуйте с агрономом и проверьте прогноз на ближайшие 3–4 часа.',
            factors
        };
    }
    return {
        status: 'ok',
        title: 'Окно для опрыскивания открыто',
        hint: 'Ветер, влажность и осадки в допустимых пределах. Можно планировать выезд бригады.',
        factors
    };
}
//# sourceMappingURL=sprayWindow.js.map