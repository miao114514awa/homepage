document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

function handlePress(event) {
    this.classList.add('pressed');
}

function handleRelease(event) {
    this.classList.remove('pressed');
}

function handleCancel(event) {
    this.classList.remove('pressed');
}

var buttons = document.querySelectorAll('.projectItem');
buttons.forEach(function (button) {
    button.addEventListener('mousedown', handlePress);
    button.addEventListener('mouseup', handleRelease);
    button.addEventListener('mouseleave', handleCancel);
    button.addEventListener('touchstart', handlePress);
    button.addEventListener('touchend', handleRelease);
    button.addEventListener('touchcancel', handleCancel);
});

function toggleClass(selector, className) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
        element.classList.toggle(className);
    });
}

function pop(imageURL) {
    var tcMainElement = document.querySelector(".tc-img");
    if (imageURL && tcMainElement) {
        try { tcMainElement.src = imageURL; } catch (e) {}
    }

    // 如果页面没有 .tc 或 .tc-main，直接返回
    var hasTc = document.querySelectorAll('.tc').length > 0;
    var hasTcMain = document.querySelectorAll('.tc-main').length > 0;
    if (!hasTc && !hasTcMain) return;

    toggleClass(".tc-main", "active");
    toggleClass(".tc", "active");
    try { document.body.classList.toggle('tc-open'); } catch(e) {}
}

function pop(imageURL) {
    var tc = document.querySelector('.tc');
    var tcMain = document.querySelector('.tc-main');
    var tcImg = document.querySelector('.tc-img');

    if (!tc || !tcMain) return;

    // 设置图片（如果提供）
    if (imageURL && tcImg) {
        try { tcImg.src = imageURL; } catch (e) {}
    }

    // 如果已经打开，则执行关闭流程（先做出场动画，再彻底隐藏）
    if (tc.classList.contains('active')) {
        // 触发出场动画：移除 modal card 的 active 状态
        tcMain.classList.remove('active');

        // 在 modal card 动画结束时，彻底移除 overlay 的 active 状态并清理资源
        var onEnd = function (ev) {
            // 仅在 transform 或 opacity 过渡结束时处理
            if (ev && ev.propertyName && !(ev.propertyName.indexOf('transform') >= 0 || ev.propertyName.indexOf('opacity') >= 0)) return;
            tc.classList.remove('active');
            try { document.body.classList.remove('tc-open'); } catch (e) {}
            if (tcImg) {
                try { tcImg.src = ''; } catch (e) {}
            }
            tcMain.removeEventListener('transitionend', onEnd);
        };

        tcMain.addEventListener('transitionend', onEnd);
        return;
    }

    // 打开流程：先显示 overlay，再触发卡片入场动画
    tc.classList.add('active');
    try { document.body.classList.add('tc-open'); } catch (e) {}

    // 两次 rAF 确保浏览器完成布局，然后触发过渡
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            tcMain.classList.add('active');
        });
    });
}

// 点击 overlay 时关闭弹窗；点击卡片内部不关闭（阻止冒泡）
document.addEventListener('click', function (e) {
    var tc = document.querySelector('.tc');
    var tcMain = document.querySelector('.tc-main');
    if (!tc || !tcMain) return;

    if (tc.contains(e.target) && !tcMain.contains(e.target)) {
        // 点击到 overlay 区域
        pop();
    }
});

// 阻止卡片内部点击冒泡（已在全局监听中做了判定，但保留以防外部脚本改变结构）
document.addEventListener('click', function (e) {
    var tcMain = document.querySelector('.tc-main');
    if (tcMain && tcMain.contains(e.target)) {
        e.stopPropagation();
    }
}, true);

// 使用 Esc 快捷键关闭弹窗
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        var tc = document.querySelector('.tc');
        if (tc && tc.classList.contains('active')) pop();
    }
});



function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) == 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

document.addEventListener('DOMContentLoaded', function () {

    var html = document.querySelector('html');
    var tanChiShe = document.getElementById("tanChiShe");

    // 获取用户偏好：'auto'（默认） | 'Light' | 'Dark'
    var userPref = localStorage.getItem('themePreference') || 'auto';

    function detectByBeijingTime() {
        var d = new Date();
        var utcHour = d.getUTCHours();
        var beijingHour = (utcHour + 8) % 24; // 北京时间 = UTC + 8
        return (beijingHour >= 6 && beijingHour < 18) ? 'Light' : 'Dark';
    }

    function changeTheme(theme, savePreference) {
        if (tanChiShe) tanChiShe.src = "./static/svg/snake-" + theme + ".svg";
        if (html) html.dataset.theme = theme;
        setCookie("themeState", theme, 365);

        // 同步 body 的 dark-mode 类和开关状态
        var cb = document.getElementById('myonoffswitch');
        if (theme === 'Dark') {
            document.body.classList.add('dark-mode');
            if (cb) cb.checked = false;
        } else {
            document.body.classList.remove('dark-mode');
            if (cb) cb.checked = true;
        }

        if (savePreference === true) {
            // 手动更改时保存到 localStorage（覆盖自动）
            localStorage.setItem('themePreference', theme);
            userPref = theme;
        }
    }

    // 决定要应用的主题：优先用户手动偏好，否则按北京时间自动判断
    var appliedTheme = (userPref === 'auto') ? detectByBeijingTime() : userPref;

    // 开关切换：作为手动更改，保存到 localStorage
    var Checkbox = document.getElementById('myonoffswitch');
    if (Checkbox) {
        // 初始化开关状态
        Checkbox.checked = (appliedTheme === 'Light');
        Checkbox.addEventListener('change', function () {
            var newTheme = this.checked ? 'Light' : 'Dark';
            changeTheme(newTheme, true);
        });
    }

    changeTheme(appliedTheme, false);
    var fpsElement = document.createElement('div');
    fpsElement.id = 'fps';
    fpsElement.style.zIndex = '10000';
    fpsElement.style.position = 'fixed';
    fpsElement.style.top = '10px';
    fpsElement.style.right = '10px';
    fpsElement.style.backgroundColor = 'rgba(172, 26, 26, 0.7)';
    fpsElement.style.color = 'white';
    fpsElement.style.padding = '5px 10px';
    fpsElement.style.borderRadius = '5px';
    fpsElement.style.fontFamily = 'Arial, sans-serif';
    fpsElement.style.fontSize = '12px';
    document.body.insertBefore(fpsElement, document.body.firstChild);

    var showFPS = (function () {
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        var fps = 0,
            last = Date.now(),
            offset, step, appendFps;

        step = function () {
            offset = Date.now() - last;
            fps += 1;

            if (offset >= 1000) {
                last += offset;
                appendFps(fps);
                fps = 0;
            }

            requestAnimationFrame(step);
        };

        appendFps = function (fpsValue) {
            fpsElement.textContent = 'FPS: ' + fpsValue;
        };

        step();
    })();

    //pop('./static/img/tz.jpg')

    // Site uptime: reads start date from body[data-site-start] (YYYY-MM-DD)
    (function () {
        try {
            var uptimeEl = document.getElementById('site-uptime');
            if (!uptimeEl) return;
            var startStr = document.body.getAttribute('data-site-start') || '2023-01-01';
            var startDate = new Date(startStr + 'T00:00:00');
            if (isNaN(startDate.getTime())) startDate = new Date('2023-01-01T00:00:00');

            function computeYearsDays(start, now) {
                var years = now.getFullYear() - start.getFullYear();
                var anniv = new Date(start);
                anniv.setFullYear(start.getFullYear() + years);
                if (anniv > now) {
                    years -= 1;
                    anniv.setFullYear(start.getFullYear() + years);
                }
                var msPerDay = 1000 * 60 * 60 * 24;
                var days = Math.floor((now - anniv) / msPerDay);
                return { years: years, days: days };
            }

            function updateUptime() {
                var now = new Date();
                if (now < startDate) {
                    uptimeEl.textContent = '本站即将上线';
                    uptimeEl.title = '上线日期：' + startDate.toLocaleDateString();
                    return;
                }
                var r = computeYearsDays(startDate, now);
                var years = r.years;
                var days = r.days;
                var text = '';
                if (years > 0) {
                    text = '运行了' + years + '年' + days + '天';
                } else {
                    text = '运行了' + days + '天';
                }
                uptimeEl.textContent = text;
                uptimeEl.title = '自 ' + startDate.toLocaleDateString() + ' 起运营';
            }

            updateUptime();
            // 每小时更新一次
            setInterval(updateUptime, 60 * 60 * 1000);
        } catch (e) { console.warn('uptime init failed', e); }
    })();

});




var pageLoading = document.querySelector("#zyyo-loading");
window.addEventListener('load', function() {
    setTimeout(function() {
        if (pageLoading) {
            try { pageLoading.style.opacity = '0'; } catch(e) {}
        }
    }, 100);
});

