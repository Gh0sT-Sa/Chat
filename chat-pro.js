javascript: (function() {
    // 1) نظام التنبيهات (تم دمجه مع كودك وتطويره ليدعم الأنواع المختلفة)
    var toastContainer = document.getElementById("mobile-toast-container") || (function() {
        var c = document.createElement("div");
        c.id = "mobile-toast-container";
        c.style = "position:fixed; top:10px; left:10px; z-index:9999999; display:flex; flex-direction:column; gap:10px; pointer-events:none;";
        document.body.appendChild(c);
        return c;
    })();

    function showCustomToast(title, user, extraMsg, type) {
        var toast = document.createElement("div");
        toast.onclick = () => toast.remove();
        
        // تحديد لون التنبيه حسب نوعه
        var borderColor = type === 'admin' ? '#007bff' : type === 'pm' ? '#e83e8c' : '#333';
        var titleColor = type === 'admin' ? '#007bff' : type === 'pm' ? '#e83e8c' : '#000';

        toast.style = `background:#f0f0f0; border:2px solid #333; border-right:6px solid ${borderColor}; border-radius:10px; padding:10px; max-width:280px; font-family:sans-serif; color:#000; box-shadow:0 2px 6px rgba(0,0,0,.2); cursor:pointer; text-align:right; direction:rtl; pointer-events:auto;`;
        
        toast.innerHTML = `
            <div style="font-weight:bold;text-align:center;margin-bottom:8px;color:${titleColor}">🔔 ${title}</div>
            <div style="display:flex;align-items:center;gap:8px">
                <img src="${user.pic}" style="width:32px;height:32px;border-radius:50%;border:1px solid #ccc">
                ${user.ico ? `<img src="${user.ico}" style="height:20px">` : ""}
                <div style="flex-grow:1">
                    <div style="font-weight:bold">${user.name}</div>
                    <div style="font-size:12px;color:gray">${user.hash}</div>
                </div>
            </div>
            <div style="margin-top:10px;padding:8px;background:#e0e0e0;border-radius:6px;text-align:center;font-weight:bold;word-break:break-word;">
                ${extraMsg}
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => { if(toast) toast.remove(); }, 12000);
    }

    // دالة مساعدة لاستخراج بيانات العضو
    function getUInfo(el) {
        return {
            name: el.querySelector('.u-topic, .u-name')?.innerText || "مجهول",
            hash: [...el.classList].find(c => c.startsWith('uid'))?.slice(3) || "غير معروف",
            pic: el.querySelector('.u-pic')?.src || "pic.png",
            ico: el.querySelector('.u-ico')?.src || ""
        };
    }

    // 2) كودك الأساسي: إصلاح الإطارات والألوان ومنع الكلاسات المزعجة
    function fixHiddenFrames() {
        document.querySelectorAll('.uzr').forEach(el => {
            // منع إضافة الكلاس __rv_me نهائياً
            if (!el._patched) {
                const originalAdd = el.classList.add;
                el.classList.add = function(...args) {
                    if (args.includes('__rv_me')) return;
                    originalAdd.apply(this, args);
                };
                el._patched = true;
            }

            // إزالة الكلاسات المزعجة
            ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(cls => {
                if (el.classList.contains(cls)) {
                    el.classList.remove(cls);
                    el.style.width = '';
                    el.style.height = '';
                }
            });

            // توحيد لون الاسم
            const topic = el.querySelector('.u-topic');
            if (topic) {
                topic.style.color = '#0000ff';
            }
        });
    }

    // 3) كودك الأساسي: فتح الخاص/البروفايل لأصحاب s4 مع تنبيه المخفي
    function enablePrivateChatOnS4() {
        document.querySelectorAll('.uzr').forEach(user => {
            const img = user.querySelector('img.ustat');
            if (!img || !img.getAttribute('src').includes('s4.png')) return;
            
            user.style.cursor = "pointer";
            if (!user._privateBound) {
                user.addEventListener("click", function(e) {
                    e.stopImmediatePropagation();
                    const uidClass = [...user.classList].find(c => c.startsWith("uid"));
                    const userId = uidClass ? uidClass.slice(3) : null;
                    if (userId && typeof openw === "function") {
                        openw(userId); // فتح البروفايل كما طلبت
                    }
                });
                user._privateBound = true;
            }

            // التنبيه الخاص بالمخفي (كودك الأساسي)
            if (!user._hiddenAlerted) {
                showCustomToast("تنبيه مخفي", getUInfo(user), "دخل مخفي للروم", "hidden");
                user._hiddenAlerted = true;
            }
        });
    }

    // 4) الإضافة الجديدة: تنبيهات الإدارة والخاص
    function monitorNewAlerts() {
        // تنبيه دخول الإداري
        document.querySelectorAll('#users .uzr.inroom').forEach(el => {
            if (el._adminAlerted) return;
            const html = el.innerHTML;
            // التحقق من الرتب الإدارية بناءً على الأيقونات والكلاسات
            if (html.includes('admin') || html.includes('mod') || html.includes('label-primary') || html.includes('ico/a')) {
                showCustomToast("دخول إداري", getUInfo(el), "قام الإداري بالدخول إلى الروم", "admin");
                el._adminAlerted = true;
            }
        });

        // تنبيه الرسائل الخاصة
        document.querySelectorAll('#d2 .uhtml, #d2 .uzr').forEach(el => {
            if (el._pmAlerted) return;
            const text = el.innerText;
            if (text.includes("رسالة خاصة") || el.classList.contains('priv') || el.classList.contains('pmsgc')) {
                let senderInfo = getUInfo(el);
                let msgContent = el.querySelector('.u-msg')?.innerText || text.replace('رسالة خاصة','').trim();
                
                showCustomToast("رصد رسالة خاصة", senderInfo, `قام بإرسال رسالة بالخاص. النص: <br><span style="color:blue;">${msgContent}</span>`, "pm");
                el._pmAlerted = true;
            }
        });
    }

    // 5) المراقبة (Observer) - نفس كودك لتشغيل الوظائف
    const observer = new MutationObserver(() => {
        const searchBox = document.getElementById('usearch');
        if (searchBox && searchBox.value.trim().length > 0) return;

        fixHiddenFrames();
        enablePrivateChatOnS4();
        monitorNewAlerts(); // الإضافة الجديدة
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // تشغيل أولي
    fixHiddenFrames();
    enablePrivateChatOnS4();
    monitorNewAlerts();

    console.log("✅ Script Loaded: Base Code + New Alerts (Admin & Private)");
})();
