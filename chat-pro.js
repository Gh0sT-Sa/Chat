javascript:(function() {
    // 1. إعداد حاوية التنبيهات الاحترافية
    var toastContainer = document.getElementById("mobile-toast-container") || (function() {
        var c = document.createElement("div");
        c.id = "mobile-toast-container";
        c.style = "position:fixed; top:10px; right:10px; width:320px; z-index:999999; pointer-events:none; font-family:serif;";
        document.body.appendChild(c);
        return c;
    })();

    function showAdvancedToast(title, user, targetUser, extraMsg, type) {
        var toast = document.createElement("div");
        toast.style = "background:#fff; border:1px solid #333; border-radius:8px; padding:10px; margin-bottom:8px; direction:rtl; text-align:right; box-shadow:0 4px 15px rgba(0,0,0,0.3); pointer-events:auto; border-right:6px solid " + (type === 'admin' ? '#007bff' : type === 'private' ? '#e83e8c' : '#dc3545');
        
        var userHtml = `
            <div style="display:flex; align-items:center; gap:8px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <img src="${user.pic}" style="width:35px; height:35px; border-radius:50%; border:1px solid #ddd;">
                <div>
                    <div style="font-weight:bold; font-size:13px; color:#c00;">${user.name} <img src="${user.ico}" style="height:14px;"></div>
                    <div style="font-size:10px; color:#666;">ID: ${user.hash} | ${user.co}</div>
                </div>
            </div>`;

        var targetHtml = targetUser ? `
            <div style="display:flex; align-items:center; gap:8px; margin-top:5px; border-top:1px dashed #ccc; padding-top:5px;">
                <span style="font-size:11px; color:#777;">إلى:</span>
                <img src="${targetUser.pic}" style="width:25px; height:25px; border-radius:50%;">
                <span style="font-size:12px; font-weight:bold;">${targetUser.name}</span>
            </div>` : "";

        toast.innerHTML = `
            <div style="font-weight:bold; text-align:center; color:#333; font-size:12px; margin-bottom:5px;">📢 ${title}</div>
            ${userHtml}
            ${targetHtml}
            <div style="margin-top:8px; padding:6px; background:#f9f9f9; border-radius:4px; font-size:12px; color:#000; border:1px solid #eee;">
                ${extraMsg}
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => { if(toast) toast.remove(); }, 12000);
    }

    // 2. استخراج بيانات العضو من عنصر الـ DOM
    function getUserData(el) {
        if(!el) return null;
        return {
            name: el.querySelector('.u-topic')?.innerText || "مجهول",
            hash: [...el.classList].find(c => c.startsWith('uid'))?.slice(3) || "Reading..",
            pic: el.querySelector('.u-pic')?.src || "pic.png",
            ico: el.querySelector('.u-ico')?.src || "",
            co: el.querySelector('.co.ico')?.getAttribute('title') || el.querySelector('.co.ico')?.src || "غير معروف"
        };
    }

    // 3. المحرك الأساسي للمراقبة
    function runRadarV14() {
        document.querySelectorAll('.uzr').forEach(el => {
            if (el._processed) return;
            
            var html = el.innerHTML;
            var user = getUserData(el);

            // أ- رصد دخول المخفي (s4.png)
            if (html.includes('s4.png')) {
                showAdvancedToast("دخول مخفي للروم", user, null, "دخل العضو أعلاه الشات/الروم بوضعية التخفي 🕵️", "hidden");
                
                // تطوير ميزة فتح البروفايل بدلاً من الخاص
                el.style.cursor = "pointer";
                el.onclick = function(e) {
                    e.stopImmediatePropagation();
                    if (user.hash && typeof openw === 'function') openw(user.hash); 
                };
            }

            // ب- رصد دخول إداري (بناءً على الأيقونات المعروفة للادارة في 12chat)
            if (html.includes('ico/a') || html.includes('label-primary')) {
                 showAdvancedToast("تنبيه دخول إداري", user, null, "قام الإداري أعلاه بالدخول الآن للدردشة 🛡️", "admin");
            }

            el._processed = true;
        });

        // ج- رصد الخاص والطرد من منطقة الرسائل (d2)
        document.querySelectorAll('#d2 .uhtml, #d2 .uzr').forEach(msgEl => {
            if (msgEl._msgChecked) return;
            var text = msgEl.innerText;

            // رصد الخاص
            if (text.includes("رسالة خاصة")) {
                var sender = getUserData(msgEl);
                var message = msgEl.querySelector('.u-msg')?.innerText || "نص مخفي";
                showAdvancedToast("رصد رسالة خاصة", sender, null, `قام بإرسال خاص: ${message}`, "private");
            }

            // رصد الطرد
            if (text.includes("طرد") || text.includes("باند")) {
                var admin = getUserData(msgEl);
                showAdvancedToast("رصد حالة طرد", admin, null, text, "kick");
            }

            msgEl._msgChecked = true;
        });
    }

    // 4. إصلاح الإطارات وإخفاء الزخارف المزعجة (كما في طلبك السابق)
    function cleanUI() {
        document.querySelectorAll('.uzr').forEach(el => {
            ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(cls => {
                if (el.classList.contains(cls)) {
                    el.classList.remove(cls);
                    el.style.width = ''; el.style.height = '';
                }
            });
        });
    }

    // 5. تفعيل المراقبة المستمرة (MutationObserver)
    const observer = new MutationObserver(() => {
        runRadarV14();
        cleanUI();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    // تشغيل احتياطي كل ثانيتين لضمان عدم التعطل
    setInterval(() => {
        runRadarV14();
        cleanUI();
    }, 2000);

    console.log("✅ Radar V14 Active: Monitoring Hidden, Admins, Private & Kicks.");
})();javascript: (function() {
    /* 1. إعداد الحاوية */
    if (!document.getElementById("mobile-toast-container")) {
        var container = document.createElement("div");
        container.id = "mobile-toast-container";
        container.style = "position:fixed;top:10px;right:10px;width:300px;z-index:999999;pointer-events:none;";
        document.body.appendChild(container);
    }

    /* 2. دالة التنبيه (محسنة لضمان جلب الصور والبيانات) */
    function showEnhancedToast(title, user, actionText, extraData = "") {
        var toast = document.createElement("div");
        toast.onclick = () => toast.remove();
        toast.style = "background:#f0f0f0;border:2px solid #333;border-radius:10px;padding:10px;margin-top:10px;max-width:280px;font-family:sans-serif;color:#000;box-shadow:0 2px 6px rgba(0,0,0,.2);cursor:pointer;text-align:right;direction:rtl;pointer-events:auto;";
        
        var name = user.name || "عضو";
        var hash = user.hash || "---";
        var pic = user.pic || "https://via.placeholder.com/35"; // صورة افتراضية في حال الفشل
        var icon = user.icon ? `<img src="${user.icon}" style="height:20px">` : "";
        var country = user.country ? `<img src="${user.country}" style="height:15px">` : "";

        toast.innerHTML = `
            <div style="font-weight:bold;text-align:center;margin-bottom:8px">🔔 ${title}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
                <img src="${pic}" style="width:35px;height:35px;border-radius:50%;border:1px solid #ccc">
                <div style="flex-grow:1">
                    <div style="font-weight:bold;font-size:13px">${name} ${icon} ${country}</div>
                    <div style="font-size:11px;color:blue;font-weight:bold">${hash}</div>
                </div>
            </div>
            <div style="padding:5px;background:#e0e0e0;border-radius:6px;text-align:center;font-weight:bold;font-size:12px;">
                ${actionText}
            </div>
            ${extraData ? `<div style="margin-top:5px;font-size:12px;color:#d00;border-top:1px dashed #999;padding-top:5px;word-break:break-all">💬 ${extraData}</div>` : ""}
        `;
        document.getElementById("mobile-toast-container").appendChild(toast);
        setTimeout(() => { if(toast) toast.remove(); }, 12000);
    }

    /* 3. دالة استخراج البيانات (مطورة جداً لجلب الهاش والصورة) */
    function getFullUserData(el) {
        // محاولة جلب الهاش من كلاس الـ UID أو من التوبيك
        var foundHash = [...el.classList].find(c => c.startsWith('uid'))?.slice(3) || 
                        el.querySelector('.u-topic')?.innerText || "مخفي";
        
        return {
            name: el.querySelector('.u-name')?.innerText || el.innerText.split('\n')[0],
            hash: foundHash,
            pic: el.querySelector('.u-pic')?.src || el.querySelector('img.avatar')?.src || "",
            icon: el.querySelector('.u-icon')?.src || el.querySelector('.ustat')?.src || "",
            country: el.querySelector('.u-flg')?.src || ""
        };
    }

    /* 4. المراقبة الشاملة (الماكينة التي لا تنام) */
    function runEnhancedMonitoring() {
        // أولاً: فحص قائمة المستخدمين (الأسماء والمخفيين)
        document.querySelectorAll('.uzr').forEach(el => {
            var data = getFullUserData(el);
            var html = el.innerHTML;
            
            // رصد المخفي (s4.png)
            if (html.includes('s4.png') && !el._monHidden) {
                showEnhancedToast("تنبيه مخفي", data, "متواجد الآن (مخفي)");
                el._monHidden = true;
                
                // تطوير ميزة النقر لفتح البروفايل
                el.style.cursor = "pointer";
                if (!el._profileBound) {
                    el.addEventListener("click", function(e) {
                        e.stopPropagation();
                        var uid = [...el.classList].find(c => c.startsWith('uid'))?.slice(3);
                        if (uid && typeof openw === "function") openw(uid);
                    });
                    el._profileBound = true;
                }
            }

            // رصد الإداري (star.png أو كلاس admin)
            if ((html.includes('star.png') || el.classList.contains('admin')) && !el._monAdmin) {
                showEnhancedToast("تنبيه إداري", data, "دخل الإداري للروم/الشات");
                el._monAdmin = true;
            }
        });

        // ثانياً: فحص منطقة الرسائل (الخاص والطرد)
        document.querySelectorAll('#d2 .msg').forEach(msg => {
            if (msg._processed) return;
            var txt = msg.innerText;

            // رصد الخاص وسحب النص
            if (txt.includes("رسالة خاصة")) {
                var senderData = getFullUserData(msg);
                var content = txt.split("رسالة خاصة")[1] || "محتوى مخفي";
                showEnhancedToast("رسالة خاصة", senderData, "أرسل لك رسالة خاصة", content);
            }

            // رصد الطرد
            if (txt.includes("طرد") || txt.includes("بواسطة")) {
                showEnhancedToast("تنبيه طرد", {name: "النظام"}, "تم رصد حالة طرد", txt);
            }

            msg._processed = true;
        });
    }

    /* 5. الوظائف الأصلية (دمج بدون تعديل) */
    function fixHiddenFrames() {
        document.querySelectorAll('.uzr').forEach(el => {
            if (!el._patched) {
                const originalAdd = el.classList.add;
                el.classList.add = function(...args) {
                    if (args.includes('__rv_me')) return;
                    originalAdd.apply(el, args);
                };
                el._patched = true;
            }
            if (el.classList.contains('__rv_me')) el.classList.remove('__rv_me');
            ['ahmed', 'mhmood', '__rv_me'].forEach(cls => {
                if (el.classList.contains(cls)) {
                    el.classList.remove(cls);
                    el.style.width = el.style.height = '';
                }
            });
            if (el.classList.contains('custom-alaw')) el.classList.remove('custom-alaw');
        });
    }

    /* 6. التشغيل المستمر (Interval) */
    setInterval(() => {
        fixHiddenFrames();
        runEnhancedMonitoring();
    }, 2000);

    console.log("🚀 Elite Spy Script Active - Monitoring: Hidden, Admin, Private, Kicks.");
})();
