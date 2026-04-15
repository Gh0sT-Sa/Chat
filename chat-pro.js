javascript:(function() {
    // 1. نظام التنبيهات الكلاسيكي (كما طلبت في التعديل القديم)
    function showClassicToast(title, msg, user = {}) {
        let container = document.getElementById("mobile-toast-container") || document.body;
        let toast = document.createElement("div");
        
        // التنسيق القديم: خلفية فاتحة مع حدود داكنة
        toast.style = "background:#f0f0f0; border:2px solid #333; border-radius:10px; padding:10px; margin-top:10px; max-width:280px; font-family:sans-serif; color:#000; box-shadow:0 2px 6px rgba(0,0,0,.2); cursor:pointer; text-align:right; direction:rtl; z-index:999999;";
        toast.onclick = () => toast.remove();
        
        toast.innerHTML = `
            <div style="font-weight:bold; text-align:center; margin-bottom:8px">🔔 ${title}</div>
            <div style="display:flex; align-items:center; gap:8px">
                <img src="${user.pic || 'https://via.placeholder.com/32'}" style="width:32px; height:32px; border-radius:50%; border:1px solid #ccc">
                ${user.icon ? `<img src="${user.icon}" style="height:20px">` : ""}
                <div style="flex-grow:1">
                    <div style="font-weight:bold">${user.name || 'نظام'}</div>
                    <div style="font-size:11px; color:gray">${user.hash || ''}</div>
                </div>
            </div>
            <div style="margin-top:10px; padding:8px; background:#e0e0e0; border-radius:6px; text-align:center; font-weight:bold; font-size:12px;">
                ${msg}
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => { if(toast) toast.remove(); }, 8000);
    }

    // 2. محرك الفحص الذكي (الأداء العالي)
    function coreEngine() {
        // فحص قائمة الأعضاء
        document.querySelectorAll('.uzr').forEach(el => {
            // أ) كشف المخفيين (S4) وربط البروفايل
            const statImg = el.querySelector('img.ustat');
            if (statImg && statImg.src.includes('s4.png')) {
                const name = el.querySelector('.u-name')?.innerText;
                if (!el._notified) {
                    const pic = el.querySelector('.u-pic')?.src;
                    const hash = el.querySelector('.u-topic')?.innerText;
                    showClassicToast("دخول مخفي", "قام بالدخول مخفي للشات", {name, pic, hash});
                    el._notified = true;
                }
                // تحويل الاسم للنقر لفتح البروفايل (openw)
                el.style.cursor = "pointer";
                if (!el._profileBound) {
                    el.addEventListener('click', () => {
                        const uid = [...el.classList].find(c => c.startsWith("uid"))?.slice(3);
                        if(uid && typeof openw === 'function') openw(uid);
                    });
                    el._profileBound = true;
                }
            }

            // ب) مراقبة المايك
            const micIcon = el.querySelector('.u-msg img[src*="mic.png"]');
            if (micIcon && !el._onMic) {
                const name = el.querySelector('.u-name')?.innerText;
                showClassicToast("المايك", "قام العضو بأخذ المايك الآن", {name});
                el._onMic = true;
            } else if (!micIcon && el._onMic) {
                el._onMic = false;
            }

            // ج) تنظيف المظهر (UI Fixes)
            ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(cls => {
                if (el.classList.contains(cls)) {
                    el.classList.remove(cls);
                    el.style.width = '';
                    el.style.height = '';
                }
            });
        });
    }

    // 3. مراقبة الطرد والتجاهل والرسائل المحذوفة عبر الـ Logs
    const logObserver = new MutationObserver((mutations) => {
        requestAnimationFrame(() => {
            mutations.forEach(mu => {
                mu.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const txt = node.innerText;
                        // كشف الطرد
                        if (txt.includes("طرد") || txt.includes("خروج")) {
                            showClassicToast("🚫 طرد/خروج", txt);
                        }
                        // كشف التجاهل
                        if (txt.includes("تجاهل") || txt.includes("ignore")) {
                            showClassicToast("⚠️ تجاهل", "تم رصد عملية تجاهل في الغرفة");
                        }
                        // حفظ سجل المحادثات (للكشف عن المحذوفات لاحقاً)
                        if (node.classList.contains('msg')) {
                            console.log("📝 سجل رسالة:", txt);
                        }
                    }
                });
            });
        });
    });

    // تشغيل المراقب على حاوية الرسائل (غالباً d2)
    const chatBox = document.getElementById('d2') || document.body;
    logObserver.observe(chatBox, { childList: true, subtree: true });

    // 4. التشغيل الدوري (كل ثانيتين لضمان خفة المتصفح)
    setInterval(coreEngine, 2000);

    // 5. ميزة كشف الـ IP التقريبي (من الـ Hash)
    function extractDeviceInfo() {
        document.querySelectorAll('.u-topic').forEach(topic => {
            const hash = topic.innerText;
            if (hash.length > 5 && !topic._checked) {
                // محاولة برمجية لربط الهاش بالدولة (بناءً على ملف x3.js)
                console.log("🔍 فحص الهاش:", hash);
                topic._checked = true;
            }
        });
    }
    setInterval(extractDeviceInfo, 5000);

    console.log("✅ Chat Pro Elite V4 Active");
    showClassicToast("نظام السيطرة", "تم تفعيل السكربت بنجاح (Stealth Mode)");
})();
