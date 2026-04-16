javascript: (function() {

    // 1) إعدادات الهاشات للأصدقاء (VIP)
    // أضف الهاشات التي تريد تمييزها هنا
    const myVIPHashes = ["12345678", "ABCDEFGH"]; 

    // 2) دالة إظهار التنبيه (Toast) عند دخول مخفي
    function showToast(user) {
        if (document.getElementById(`toast-${user.hash}`)) return;
        const container = document.getElementById("mobile-toast-container") || document.body;
        const toast = document.createElement("div");
        toast.id = `toast-${user.hash}`;
        toast.onclick = () => toast.remove();
        toast.style = "background:#f0f0f0;border:2px solid #333;border-radius:10px;padding:10px;margin-top:10px;max-width:280px;font-family:sans-serif;color:#000;box-shadow:0 2px 6px rgba(0,0,0,.2);cursor:pointer;text-align:left;position:fixed;top:20px;right:20px;z-index:99999;";
        toast.innerHTML = `
            <div style="font-weight:bold;text-align:center;margin-bottom:8px">🔔 تنبيه دخول مخفي</div>
            <div style="display:flex;align-items:center;gap:8px">
                <img src="${user.pic}" style="width:32px;height:32px;border-radius:50%;border:1px solid #ccc">
                <div style="flex-grow:1">
                    <div style="font-weight:bold">${user.name}</div>
                    <div style="font-size:11px;color:gray">${user.hash}</div>
                </div>
            </div>
            <div style="margin-top:10px;padding:5px;background:#e0e0e0;border-radius:6px;text-align:center;font-weight:bold;font-size:12px">دخل مخفي للروم</div>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 6000);
    }

    // 3) دالة إظهار المستخدمين المخفيين في القائمة
    function showUsers() {
        document.querySelectorAll('.uzr:not(.inroom)').forEach(el => {
            el.style.display = 'block';
            if (!el.classList.contains('detected-hidden')) {
                el.classList.add('detected-hidden');
                el.style.border = '2px dashed red'; // تمييزه ببرواز مقطع أحمر
            }
        });
    }

    // 4) فحص المخفيين وإرسال التنبيه
    const notifiedUsers = new Set();
    function checkHiddenUsers() {
        document.querySelectorAll('.uzr').forEach(userEl => {
            const isVisible = userEl.classList.contains('inroom');
            if (!isVisible) {
                const name = userEl.querySelector('.u-msg')?.textContent || "مستخدم مخفي";
                const pic = userEl.querySelector('img.u-pic')?.src || "";
                const hash = [...userEl.classList].find(c => c.length > 5 && !c.startsWith('uid')) || "unknown";
                
                if (!notifiedUsers.has(hash)) {
                    showToast({ name, pic, hash });
                    notifiedUsers.add(hash);
                }
            }
        });
    }

    // 5) إصلاح الإطارات والألوان
    function fixHiddenFrames() {
        document.querySelectorAll('.uzr').forEach(el => {
            ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(cls => {
                if (el.classList.contains(cls)) {
                    el.classList.remove(cls);
                    el.style.width = ''; el.style.height = '';
                }
            });
        });
    }

    // 6) إضافة فتح الخاص عند الضغط على s4.png
    function enablePrivateChatOnS4() {
        document.querySelectorAll('#users .uzr').forEach(user => {
            const img = user.querySelector('img.ustat');
            if (img?.src.includes('s4.png') && !user._privateBound) {
                user.style.cursor = "pointer";
                user.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const uid = [...user.classList].find(c => c.startsWith("uid"))?.slice(3);
                    if (uid && typeof openw === "function") openw(uid, true);
                });
                user._privateBound = true;
            }
        });
    }

    // 🌟 7) الإضافة الجديدة: تمييز الأصدقاء (VIP)
    function highlightVIPUsers() {
        document.querySelectorAll('.uzr').forEach(userEl => {
            const userText = userEl.textContent || "";
            const isVIP = myVIPHashes.some(hash => userText.includes(hash));
            if (isVIP && !userEl._vipMarked) {
                userEl.style.backgroundColor = "#fffde7"; 
                userEl.style.borderRight = "5px solid #ffd700";
                const nameEl = userEl.querySelector('.u-msg');
                if (nameEl) nameEl.innerHTML = '⭐ ' + nameEl.innerHTML;
                userEl._vipMarked = true;
            }
        });
    }

    // 8) مراقبة التغييرات (Mutation Observer)
    new MutationObserver(() => {
        showUsers();
        checkHiddenUsers();
        fixHiddenFrames();
        enablePrivateChatOnS4();
        highlightVIPUsers();
    }).observe(document.body, { childList: true, subtree: true });

    // تشغيل أولي فور التنفيذ
    showUsers();
    checkHiddenUsers();
    fixHiddenFrames();
    enablePrivateChatOnS4();
    highlightVIPUsers();

    console.log("✅ تم التفعيل بنجاح: كاشف المخفيين + التنبيهات + تمييز VIP");
})();
