javascript: (function() {
    /* 1. إعداد حاوية التنبيهات إذا لم تكن موجودة */
    if (!document.getElementById("mobile-toast-container")) {
        var container = document.createElement("div");
        container.id = "mobile-toast-container";
        container.style = "position:fixed;top:10px;right:10px;width:300px;z-index:999999;pointer-events:none;";
        document.body.appendChild(container);
    }

    /* 2. دالة التنبيه المطورة الشاملة */
    function showEnhancedToast(title, user, actionText, extraData = "") {
        var toast = document.createElement("div");
        toast.onclick = () => toast.remove();
        toast.style = "background:#f0f0f0;border:2px solid #333;border-radius:10px;padding:10px;margin-top:10px;max-width:280px;font-family:sans-serif;color:#000;box-shadow:0 2px 6px rgba(0,0,0,.2);cursor:pointer;text-align:right;direction:rtl;pointer-events:auto;";
        
        /* استخراج البيانات المتاحة */
        var name = user.name || "عضو";
        var hash = user.hash || "بدون يوزر";
        var pic = user.pic || "";
        var icon = user.icon ? `<img src="${user.icon}" style="height:20px">` : "";
        var country = user.country ? `<img src="${user.country}" style="height:15px">` : "";

        toast.innerHTML = `
            <div style="font-weight:bold;text-align:center;margin-bottom:8px">🔔 ${title}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
                <img src="${pic}" style="width:35px;height:35px;border-radius:50%;border:1px solid #ccc">
                <div style="flex-grow:1">
                    <div style="font-weight:bold;font-size:13px">${name} ${icon} ${country}</div>
                    <div style="font-size:11px;color:gray">${hash}</div>
                </div>
            </div>
            <div style="padding:5px;background:#e0e0e0;border-radius:6px;text-align:center;font-weight:bold;font-size:12px;">
                ${actionText}
            </div>
            ${extraData ? `<div style="margin-top:5px;font-size:11px;color:#c00;border-top:1px solid #ccc;padding-top:3px">${extraData}</div>` : ""}
        `;
        document.getElementById("mobile-toast-container").appendChild(toast);
        setTimeout(() => toast.remove(), 10000);
    }

    /* 3. دالة استخراج بيانات العضو من عنصر DOM */
    function getUserData(el) {
        return {
            name: el.querySelector('.u-name')?.innerText || el.innerText.split('\n')[0],
            hash: [...el.classList].find(c => c.startsWith('uid'))?.slice(3) || "---",
            pic: el.querySelector('.u-pic')?.src || "",
            icon: el.querySelector('.u-icon')?.src || "",
            country: el.querySelector('.u-flg')?.src || ""
        };
    }

    /* 4. الإضافات الجديدة (المراقبة الشاملة) */
    function runEnhancedMonitoring() {
        /* أ- رصد دخول المخفيين والاداريين في الروم وقائمة الأسماء */
        document.querySelectorAll('.uzr').forEach(el => {
            var userData = getUserData(el);
            var imgStatus = el.querySelector('img.ustat')?.getAttribute('src') || "";
            
            // رصد المخفي (s4.png)
            if (imgStatus.includes('s4.png') && !el._monitoredHidden) {
                showEnhancedToast("تنبيه مخفي", userData, "دخل الشات/الروم كمخفي");
                el._monitoredHidden = true;
                
                // تطوير ميزة فتح البروفايل للمخفي (enablePrivateChatOnS4)
                el.style.cursor = "pointer";
                if (!el._profileBound) {
                    el.addEventListener("click", function(e) {
                        e.stopPropagation();
                        if (userData.hash && typeof openw === "function") {
                            openw(userData.hash); // تعديل لفتح البروفايل الكامل
                            console.log("✅ تم فتح بروفايل المخفي:", userData.hash);
                        }
                    });
                    el._profileBound = true;
                }
            }

            // رصد الإداري (يعتمد على الأيقونة أو الرتبة)
            if ((el.innerHTML.includes('star.png') || el.classList.contains('admin')) && !el._monitoredAdmin) {
                showEnhancedToast("تنبيه إداري", userData, "الإداري متواجد الآن في الشات/الروم");
                el._monitoredAdmin = true;
            }
        });

        /* ب- رصد الخاص والطرد من منطقة الرسائل (d2) */
        document.querySelectorAll('#d2 .msg').forEach(msgNode => {
            if (msgNode._read) return;

            var text = msgNode.innerText;
            
            // رصد رسائل الخاص
            if (text.includes("رسالة خاصة")) {
                var sender = getUserData(msgNode);
                showEnhancedToast("رسالة خاصة", sender, "قام بإرسال رسالة خاصة", `نص الرسالة: ${text.split(':').slice(1).join(':')}`);
            }

            // رصد الطرد
            if (text.includes("طرد") || text.includes("بواسطة")) {
                showEnhancedToast("تنبيه طرد", {name: "نظام الشات"}, "حدثت حالة طرد في الشات", text);
            }

            msgNode._read = true;
        });
    }

    /* 5. الوظائف الأصلية للسكربت (بدون تعديل - فقط دمج) */
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

    /* 6. تشغيل السكربت بشكل مستمر في الخلفية (Loop) */
    setInterval(() => {
        const searchBox = document.getElementById('usearch');
        if (searchBox && searchBox.value.trim().length > 0) return;

        fixHiddenFrames();
        runEnhancedMonitoring();
    }, 2000); // يعمل كل ثانيتين لضمان عدم التعطل

    console.log("✅ تم تفعيل السكربت المطور: مراقبة (المخفي، الإداري، الخاص، الطرد) + فتح بروفايل المخفي.");
})();
