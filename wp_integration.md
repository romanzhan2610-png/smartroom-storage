# Описание прослойки для WordPress (WP Integration Layer)

Созданный калькулятор и админ‑панель полностью готовы к интеграции в экосистему WordPress. Вот детальный план того, как эта архитектура будет работать:

## 1. Сборка через Vite
Vite компилирует весь ваш код (`index.html`, `main.js`, `main.css`) в папку `dist/`.
В настройках `vite.config.js` мы убрали хэши в именах файлов (`[name].js`), поэтому на выходе всегда будут `app.js` и `app.css`.

## 2. Шорткод WordPress (Frontend)
Вместо того чтобы вставлять `index.html` целиком, в WordPress создается плагин, который регистрирует шорткод `[smartroom_calculator]`.
При рендеринге этого шорткода:
1. WordPress подключает собранные файлы Vite (через `wp_enqueue_script` и `wp_enqueue_style`).
2. Вставляет HTML-каркас калькулятора.
3. **Критически важно:** Передает глобальные настройки из базы данных в JS с помощью `wp_localize_script()`.

**Пример (PHP):**
```php
function enqueue_calculator_assets() {
    wp_enqueue_style('smartroom-calc-styles', plugin_dir_url(__FILE__) . 'dist/assets/main.css');
    wp_enqueue_script('smartroom-calc-script', plugin_dir_url(__FILE__) . 'dist/assets/main.js', array(), false, true);
    
    // Получаем опции, сохраненные через админку
    $calc_options = get_option('smartroom_calc_settings');
    
    // Передаем настройки во Frontend-скрипт!
    wp_localize_script('smartroom-calc-script', 'StorageCalcConfig', $calc_options);
}
```
Внутри `data.js` вы будете читать `window.StorageCalcConfig.boxItemsData` вместо моковых захардкоженных данных!

## 3. Админ-панель WordPress (Backend)
Файл `admin.html` (и связанные с ним js/css) служит дизайн-макетом для страницы настроек плагина.
1. В WordPress мы регистрируем страницу настроек (Settings Page).
2. JS-файл админки (`admin.js`) при нажатии на "Save Changes" будет отправлять JSON-объект на кастомный эндпоинт **WP REST API** (например, `/wp-json/smartroom/v1/settings`).
3. PHP-код обрабатывает этот POST-запрос и сохраняет данные в таблицу `wp_options` с помощью `update_option()`.

## 4. Как они общаются?
1. Владелец сайта меняет цену на "Medium Box" с £6.0 на £7.0 в **Админке**.
2. Жмет **"Save Changes"**. Запрос летит на WP REST API и сохраняется в БД.
3. Клиент открывает страницу калькулятора. В шорткоде вызывается `wp_localize_script()`.
4. Vite-модули вашего калькулятора инициализируются с новыми ценами (£7.0) через глобальный объект `StorageCalcConfig`.

## Итог:
Эта система делает ваш лендинг **максимально изолированным**. Визуальная часть (SCSS/JS) разрабатывается локально через Vite, не завися от WP-движка, а данные пробрасываются через тонкую RESTful PHP-прослойку.
