javascript:(function() {
    // 1. إنشاء حاوية التنبيهات إذا لم تكن موجودة
    var toastContainer = document.getElementById("mobile-toast-container") || (function() {
        var c = document.createElement("div");
        c.id = "mobile-toast-container";
        c.style = "position:fixed; top:15%; left:50%; transform:translateX(-50%); width:320px; z-index:999999; pointer-events:none;";
        document.body.appendChild(c);
        return c;
    })();

    function showRadarToast(title, msg, user = {}, type = "info") {
        var toast = document.createElement("div");
        var borderColor = type === "admin" ? "#007bff" : type === "private" ? "#e83e8c" : "#333";
        toast.style = `background:#fff; border:2px solid #333; border-radius:12px; padding:12px; margin-bottom:10px; direction:rtl; text-align:right; box-shadow:0 8px 25px rgba(0,0,0,0.4); pointer-events:auto; border-right: 8px solid ${borderColor};`;
        toast.onclick = () => toast.remove();

        toast.innerHTML = `
            <div style="font-weight:bold; text-align:center; color:${borderColor}; border-bottom:1px solid #eee; margin-bottom:8px; padding-bottom:5px">🔍 ${title}</div>
            <div style="display:flex; align-items:center; gap:10px">
                <img src="${user.pic || 'pic.png'}" style="width:40px; height:40px; border-radius:50%; border:1px solid #ddd">
                <div style="flex-grow:1">
                    <div style="font-weight:bold; font-size:14px;">${user.name || 'عضو'}</div>
                    <div style="font-size:10px; color:#666;">ID: ${user.hash || 'Reading..'}</div>
                </div>
            </div>
            <div style="margin-top:8px; padding:8px; background:#f8f9fa; border-radius:6px; font-size:13px; color:#000; border:1px solid #eee;">
                ${msg}
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => { if(toast) toast.remove(); }, 12000);
    }

    // 2. دالة استخراج بيانات العضو من القائمة
    function extractUserData(el) {
        return {
            name: el.querySelector('.u-topic, .u-name')?.innerText || "مجهول",
            hash: [...el.classList].find(c => c.startsWith('uid'))?.slice(3) || "Unknown",
            pic: el.querySelector('.u-pic')?.src || "pic.png"
        };
    }

    // 3. نظام رصد دخول الإدارة والرسائل الخاصة
    function monitorSystem() {
        // أ- رصد دخول الإدارة (بناءً على الكود في x3.js)
        document.querySelectorAll('.uzr.inroom').forEach(el => {
            if (el._adminChecked) return;
            // التحقق من أيقونات الإدارة أو الكلاسات المميزة للرتب العليا
            const isManager = el.querySelector('.u-ico[src*="admin"], .u-ico[src*="mod"], .label-primary');
            if (isManager) {
                showRadarToast("دخول إداري للروم", "قام الإداري بالدخول الآن إلى الروم.", extractUserData(el), "admin");
            }
            el._adminChecked = true;
        });

        // ب- رصد الرسائل الخاصة (اعتراض عناصر الخاص في القائمة أو d2)
        document.querySelectorAll('.uzr').forEach(el => {
            // رصد وجود إشعار رسالة خاصة جديدة
            if ((el.innerText.includes("رسالة خاصة") || el.classList.contains('priv')) && !el._msgSeen) {
                const user = extractUserData(el);
                // محاولة جلب نص الرسالة من المعاينة أو الحاوية d2
                const msgText = el.querySelector('.u-msg')?.innerText || "محتوى خاص جاري استخراجه..";
                showRadarToast("رصد رسالة خاصة", `الرسالة: ${msgText}`, user, "private");
                el._msgSeen = true;
            }
        });
    }

    // 4. دالة فتح البروفايل للمخفي (كما طلبت في التعديل السابق)
    function patchS4Users() {
        document.querySelectorAll('.uzr').forEach(user => {
            const img = user.querySelector('img.ustat');
            if (img && img.src.includes('s4.png') && !user._s4Patched) {
                user.style.cursor = "pointer";
                user.addEventListener("click", function(e) {
                    e.stopImmediatePropagation();
                    const uidClass = [...user.classList].find(c => c.startsWith("uid"));
                    const userId = uidClass ? uidClass.slice(3) : null;
                    if (userId && typeof openw === "function") {
                        openw(userId); // فتح البروفايل
                    }
                });
                user._s4Patched = true;
            }
        });
    }

    // 5. المراقبة المستمرة (MutationObserver) لضمان العمل الدائم
    const mainObserver = new MutationObserver(() => {
        monitorSystem();
        patchS4Users();
        // الحفاظ على ميزة إزالة الإطارات والألوان من السكربت الأصلي
        document.querySelectorAll('.uzr').forEach(el => {
            ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(cls => {
                if (el.classList.contains(cls)) {
                    el.classList.remove(cls);
                    el.style.width = el.style.height = '';
                }
            });
        });
    });

    mainObserver.observe(document.body, { childList: true, subtree: true });

    // تشغيل أولي وتكرار أمان كل 3 ثواني
    monitorSystem();
    patchS4Users();
    setInterval(() => { monitorSystem(); patchS4Users(); }, 3000);

    console.log("✅ Radar V15: Active (Admins, Private, Hidden S4 Profile)");
})();
