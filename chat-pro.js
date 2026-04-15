javascript:(function(){
    /* إعدادات المتغيرات المموهة للحماية */
    const _0xAdminId = "SmartChat_v2";
    const _0xStorageKey = "hidden_log";

    /* 1. نظام التنبيهات الذكي (Toast) */
    function _0xShowToast(msg, user = {}) {
        let container = document.getElementById("mobile-toast-container") || document.body;
        let toast = document.createElement("div");
        toast.style = "background:#1e1e2e; border-left:4px solid #7289da; border-radius:8px; padding:12px; margin:10px auto; width:90%; color:#fff; font-family:sans-serif; box-shadow:0 4px 15px rgba(0,0,0,0.5); cursor:pointer; z-index:999999;";
        toast.onclick = () => toast.remove();
        
        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px">
                <img src="${user.pic || ''}" onerror="this.src='https://via.placeholder.com/32'" style="width:35px; height:35px; border-radius:50%; border:1px solid #444">
                <div style="flex-grow:1">
                    <div style="font-weight:bold; font-size:14px;">${user.name || 'نظام'}</div>
                    <div style="font-size:11px; color:#aaa;">${msg}</div>
                </div>
            </div>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
        
        /* إضافة للسجل التاريخي */
        _0xLogToStorage(user.name, msg);
    }

    /* 2. سجل المخفيين في LocalStorage */
    function _0xLogToStorage(name, action) {
        let logs = JSON.parse(localStorage.getItem(_0xStorageKey) || "[]");
        logs.push({ name, action, time: new Date().toLocaleTimeString() });
        if(logs.length > 50) logs.shift(); // الاحتفاظ بآخر 50 حدث فقط
        localStorage.setItem(_0xStorageKey, JSON.stringify(logs));
        console.table([logs[logs.length-1]]); // عرض الجدول في الكونسول
    }

    /* 3. معالجة الأداء وتحسين الـ MutationObserver */
    const _0xConfig = { childList: true, subtree: true };
    const _0xObserver = new MutationObserver((mutations) => {
        /* معالجة التغييرات فقط لتجنب التعليق */
        requestAnimationFrame(() => {
            _0xApplyFixes();
        });
    });

    function _0xApplyFixes() {
        document.querySelectorAll('.uzr').forEach(el => {
            /* إزالة الكلاسات المخصصة فوراً */
            ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(c => el.classList.remove(c));
            
            /* فتح الخاص الذكي عند الضغط */
            if (!el._bound) {
                el.style.cursor = "pointer";
                el.onclick = function() {
                    const uid = [...this.classList].find(c => c.startsWith("uid"))?.slice(3);
                    if(uid && typeof openw === 'function') openw(uid);
                };
                el._bound = true;
            }

            /* كشف الدولة والمخفيين */
            const statImg = el.querySelector('img.ustat');
            if (statImg && statImg.src.includes('s4.png') && !el._notified) {
                const name = el.querySelector('.u-name')?.innerText;
                const pic = el.querySelector('.u-pic')?.src;
                _0xShowToast("دخل مخفي للروم 🕵️", {name, pic});
                el._notified = true;
            }
        });
    }

    /* 4. إطلاق السكربت */
    _0xObserver.observe(document.body, _0xConfig);
    _0xApplyFixes();
    console.log("✅ Smart Chat Script Active");

    /* ميزة إضافية: زر الفلترة الذكية */
    if(!document.getElementById('filterBtn')) {
        let btn = document.createElement('button');
        btn.id = 'filterBtn';
        btn.innerText = "تصفية الزوار";
        btn.style = "position:fixed; top:10px; right:10px; z-index:9999; background:red; color:white; border:none; padding:5px; border-radius:5px;";
        btn.onclick = () => {
            document.querySelectorAll('.uzr').forEach(u => {
                if(!u.classList.contains('admin')) u.style.display = u.style.display === 'none' ? 'block' : 'none';
            });
        };
        document.body.appendChild(btn);
    }
})();
