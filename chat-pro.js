javascript:(function() {
    const _0xPowerKey = "Chat_Elite_V5";

    // 1. نظام التنبيهات الكلاسيكي المحسن (إصلاح حاوية العرض)
    function showClassicToast(title, msg, user = {}) {
        // التأكد من وجود حاوية للتنبيهات أو إنشاؤها
        let container = document.getElementById("mobile-toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "mobile-toast-container";
            container.style = "position:fixed; top:10px; right:10px; width:300px; z-index:1000000; pointer-events:none;";
            document.body.appendChild(container);
        }

        let toast = document.createElement("div");
        toast.style = "background:#f9f9f9; border:2px solid #222; border-radius:12px; padding:12px; margin-bottom:10px; width:100%; font-family:sans-serif; color:#000; box-shadow:0 4px 12px rgba(0,0,0,0.3); cursor:pointer; text-align:right; direction:rtl; pointer-events:auto; position:relative; animation: slideIn 0.3s ease-out;";
        
        toast.onclick = () => toast.remove();
        
        toast.innerHTML = `
            <div style="font-weight:bold; text-align:center; color:#d9534f; border-bottom:1px solid #ddd; margin-bottom:8px; padding-bottom:5px">🔔 ${title}</div>
            <div style="display:flex; align-items:center; gap:10px">
                <img src="${user.pic || 'https://ayemen.net/sico/ztPnGyrz7L.jpg'}" style="width:40px; height:40px; border-radius:50%; border:2px solid #ccc">
                <div style="flex-grow:1">
                    <div style="font-weight:bold; font-size:14px;">${user.name || 'نظام'}</div>
                    <div style="font-size:11px; color:#555; background:#eee; padding:2px 5px; border-radius:4px; display:inline-block; margin-top:3px">ID/Hash: ${user.hash || 'غير متوفر'}</div>
                </div>
            </div>
            <div style="margin-top:8px; padding:10px; background:#efefef; border-radius:8px; text-align:center; font-weight:bold; font-size:13px; color:#333; border:1px dashed #bbb">
                ${msg}
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => { if(toast) toast.remove(); }, 10000);
    }

    // 2. المحرك الأساسي (كشف المايك، المخفيين، والهاش)
    function powerEngine() {
        document.querySelectorAll('.uzr').forEach(el => {
            const name = el.querySelector('.u-name')?.innerText || "مستخدم";
            const pic = el.querySelector('.u-pic')?.src;
            const hash = el.querySelector('.u-topic')?.innerText || "";

            // أ) كشف المخفيين (S4)
            const statImg = el.querySelector('img.ustat');
            if (statImg && (statImg.src.includes('s4.png') || el.classList.contains('offline'))) {
                if (!el._notified) {
                    showClassicToast("دخول مخفي", "متواجد الآن بشكل مخفي في الروم", {name, pic, hash});
                    el._notified = true;
                }
                // جعل البروفايل يفتح بالكامل (openw)
                el.style.cursor = "help";
                if (!el._profileBound) {
                    el.onclick = function(e) {
                        e.preventDefault(); e.stopPropagation();
                        const uid = [...el.classList].find(c => c.startsWith("uid"))?.slice(3);
                        if(uid && typeof openw === 'function') openw(uid);
                    };
                    el._profileBound = true;
                }
            }

            // ب) كشف المايك (ربط مع ملف shbl3-m.js)
            const micIcon = el.querySelector('.u-msg img[src*="mic.png"]') || el.querySelector('.ustat[src*="mic.png"]');
            if (micIcon && !el._onMic) {
                showClassicToast("المايك", "قام العضو بأخذ المايك الآن", {name, pic, hash});
                el._onMic = true;
            } else if (!micIcon && el._onMic) {
                el._onMic = false;
            }

            // ج) تنظيف الكلاسات التمويهية (ahmed, mhmood, etc)
            ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(cls => {
                if (el.classList.contains(cls)) {
                    el.classList.remove(cls);
                    el.style.cssText = "width:100% !important; height:auto !important; display:flex !important;";
                }
            });

            // د) إظهار الهاش بجانب الاسم (للشفافية)
            if (hash && !el._hashVisible) {
                const nameNode = el.querySelector('.u-name');
                if (nameNode) {
                    const span = document.createElement('span');
                    span.innerText = ` [${hash}]`;
                    span.style = "font-size:9px; color:blue; font-weight:normal;";
                    nameNode.appendChild(span);
                    el._hashVisible = true;
                }
            }
        });
    }

    // 3. مراقبة الطرد والتجاهل (عبر رصد التغيير في حاوية d2)
    const logObserver = new MutationObserver((mutations) => {
        mutations.forEach(mu => {
            mu.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    const txt = node.innerText;
                    if (txt.includes("طرد") || txt.includes("خروج") || txt.includes("بواسطة")) {
                        showClassicToast("🚫 نظام الحماية", txt);
                    }
                    if (txt.includes("تجاهل") || txt.includes("ignore")) {
                        showClassicToast("⚠️ تنبيه", "تم رصد محاولة تجاهل أو حظر خاص");
                    }
                }
            });
        });
    });

    // استهداف حاوية الرسائل الصحيحة
    const chatBox = document.getElementById('d2') || document.querySelector('.chat-history');
    if (chatBox) logObserver.observe(chatBox, { childList: true, subtree: true });

    // 4. تشغيل التحديثات
    setInterval(powerEngine, 2000);
    
    // إضافة أنيميشن بسيط للتنبيهات
    const style = document.createElement('style');
    style.innerHTML = `@keyframes slideIn { from {transform: translateX(100%);} to {transform: translateX(0);} }`;
    document.head.appendChild(style);

    console.log("✅ Chat Pro Elite V5: Fully Operational");
    showClassicToast("نظام السيطرة V5", "تم التفعيل بنجاح. السكربت يراقب المخفيين والهاشات والمايك الآن.");
})();
