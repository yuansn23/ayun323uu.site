(function () {
    // 立即执行函数，防止变量泄露

    // 1. 禁用所有默认事件
    const events = [
        'contextmenu',
        'selectstart',
        'dragstart',
        'copy',
        'cut',
        'paste',
        'beforeprint'
    ];

    events.forEach(event => {
        document.addEventListener(event, e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }, true);
    });

    // 2. 覆盖键盘事件
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function (type, listener, options) {
        if (type === 'keydown' || type === 'keyup' || type === 'keypress') {

            const wrappedListener = function (e) {
                if (shouldBlockKeyEvent(e)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }
                return listener.call(this, e);
            };

            return originalAddEventListener.call(this, type, wrappedListener, options);
        }

        return originalAddEventListener.call(this, type, listener, options);
    };

    // 3. 键盘事件阻止逻辑
    function shouldBlockKeyEvent(e) {

        // F1-F12
        if (e.keyCode >= 112 && e.keyCode <= 123) return true;

        // 功能键
        if (['F12', 'PrintScreen', 'ScrollLock', 'Pause'].includes(e.key)) {
            return true;
        }

        // Ctrl 组合键
        if (e.ctrlKey) {
            const ctrlKeys = {
                83: true, // S
                85: true, // U
                73: true, // I
                74: true, // J
                67: true, // C
                78: true, // N
                80: true, // P
                82: true, // R
                79: true  // O
            };

            if (ctrlKeys[e.keyCode]) return true;
        }

        // Ctrl + Shift
        if (e.ctrlKey && e.shiftKey) {
            const ctrlShiftKeys = {
                73: true,
                74: true,
                67: true,
                75: true
            };

            if (ctrlShiftKeys[e.keyCode]) return true;
        }

        return false;
    }

    // 4. 防止右键菜单
    Object.defineProperty(document, 'oncontextmenu', {
        get: () => function () {
            return false;
        },
        set: () => {}
    });

    // 5. 持续保护
    setInterval(() => {
        events.forEach(event => {
            document.addEventListener(event, e => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, true);
        });
    }, 500);

})();