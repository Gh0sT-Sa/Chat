javascript: (function() {
    // 1) نظام التنبيهات 
    var toastContainer = document.getElementById("mobile-toast-container") || (function() {
        var c = document.createElement("div");
        c.id = "mobile-toast-container";
        c.style = "position:fixed; top:15px; left:15px; z-index:9999999; display:flex; flex-direction:column; gap:10px; pointer-events:none;";
        document.body.appendChild(c);
        return c;
    })();

    function showCustomToast(title, user, extraMsg, type) {
        var toast = document.createElement("div");
        toast.onclick = () => toast.remove();
        
        var borderColor = type === 'admin' ? '#007bff' : type === 'pm' ? '#e83e8c' : '#555';
        var titleColor = type === 'admin' ? '#007bff' : type === 'pm' ? '#e83e8c' : '#000';

        toast.style = `background:#f9f9f9; border:2px solid #333; border-right:6px solid ${borderColor}; border-radius:10px; padding:10px; max-width:280px; font-family:sans-serif; color:#000; box-shadow:0 4px 10px rgba(0,0,0,.3); cursor:pointer; text-align:right; direction:rtl; pointer-events:auto;`;
        
        toast.innerHTML = `
            <div style="font-weight:bold;text-align:center;margin-bottom:8px;color:${titleColor};font-size:14px;">🔔 ${title}</div>
            <div style="display:flex;align-items:center;gap:8px">
                <img src="${user.pic}" style="width:35px;height:35px;border-radius:50%;border:1px solid #ccc">
                ${user.ico ? `<img src="${user.ico}" style="height:20px">` : ""}
                <div style="flex-grow:1">
                    <div style="font-weight:bold;color:#333;font-size:13px;">${user.name}</div>
                    <div style="font-size:11px;color:gray">${user.hash}</div>
                </div>
            </div>
            <div style="margin-top:10px;padding:8px;background:#ebebeb;border-radius:6px;font-size:12px;color:#000;border:1px solid #ddd;word-break:break-word;">
                ${extraMsg}
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => { if(toast) toast.remove(); }, 12000);
    }

    function getUInfo(el) {
        return {
            name: el.querySelector('.u-topic, .u-name')?.innerText || "مجهول",
            hash: [...el.classList].find(c => c.startsWith('uid'))?.slice(3) || "غير معروف",
            pic: el.querySelector('.u-pic')?.src || "pic.png",
            ico: el.querySelector('.u-ico')?.src || ""
        };
    }

    // 2) إصلاح الإطارات (تم إزالة السطر المسبب للون الأزرق)
    function fixHiddenFrames() {
        document.querySelectorAll('.uzr').forEach(el => {
            if (!el._patched) {
                const originalAdd = el.classList.add;
                el.classList.add = function(...args) {
                    if (args.includes('__rv_me')) return;
                    originalAdd.apply(this, args);
                };
                el._patched = true;
            }
            ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(cls => {
                if (el.classList.contains(cls)) {
                    el.classList.remove(cls);
                    el.style.width = ''; el.style.height = '';
                }
            });
        });
    }

    // 3) إظهار المخفيين (جميع الرتب) + فتح البروفايل + التنبيه
    function enablePrivateChatOnS4() {
        document.querySelectorAll('.uzr').forEach(user => {
            const img = user.querySelector('img.ustat');
            if (!img || !img.getAttribute('src').includes('s4.png')) return;
            
            // إجبار النظام على إظهار المخفي في القائمة (حتى لو كان رتبة عليا)
            user.style.display = 'block';
            user.style.height = 'auto';
            user.classList.remove('hid', 'hidden');

            // ميزة فتح البروفايل (التي نجحت سابقاً)
            user.style.cursor = "pointer";
            if (!user._privateBound) {
                user.addEventListener("click", function(e) {
                    e.stopImmediatePropagation();
                    const uidClass = [...user.classList].find(c => c.startsWith("uid"));
                    const userId = uidClass ? uidClass.slice(3) : null;
                    if (userId && typeof openw === "function") {
                        openw(userId);
                    }
                });
                user._privateBound = true;
            }

            // تنبيه المخفي
            if (!user._hiddenAlerted) {
                showCustomToast("دخول مخفي للروم", getUInfo(user), "قام العضو بالدخول بوضعية التخفي 🕵️", "hidden");
                user._hiddenAlerted = true;
            }
        });
    }

    // 4) تنبيه دخول الإداري للروم
    function checkAdminEntry() {
        document.querySelectorAll('#users .uzr.inroom').forEach(el => {
            if (el._adminAlerted) return;
            const html = el.innerHTML;
            // التحقق من كلاسات الإدارة في سكريبتات الشات (مثل label-primary أو الأيقونات)
            if (html.includes('ico/a') || html.includes('label-primary') || html.includes('admin') || html.includes('mod')) {
                showCustomToast("دخول إداري للروم", getUInfo(el), "إداري متواجد الآن في الروم 🛡️", "admin");
                el._adminAlerted = true;
            }
        });
    }

    // 5) رصد الرسائل الخاصة (عبر مراقبة لحظية لمنطقة الرسائل d2)
    const d2Container = document.getElementById('d2');
    if (d2Container && !d2Container._pmObserverAttached) {
        const pmObserver = new MutationObserver(mutations => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    // إذا كان العنصر المضاف رسالة
                    if (node.nodeType === 1 && (node.classList.contains('uhtml') || node.classList.contains('uzr'))) {
                        const text = node.innerText;
                        if (text.includes("رسالة خاصة") || node.classList.contains('priv') || node.classList.contains('pmsgc')) {
                            let senderInfo = getUInfo(node);
                            let msgContent = node.querySelector('.u-msg')?.innerText || text.replace('رسالة خاصة', '').trim();
                            showCustomToast("رسالة خاصة جديدة", senderInfo, `<b>النص:</b> <span style="color:#e83e8c;">${msgContent}</span>`, "pm");
                        }
                    }
                });
            });
        });
        pmObserver.observe(d2Container, { childList: true });
        d2Container._pmObserverAttached = true;
    }

    // 6) المراقبة الشاملة (لضمان عمل كل شيء عند تحديث الأسماء)
    const observer = new MutationObserver(() => {
        const searchBox = document.getElementById('usearch');
        if (searchBox && searchBox.value.trim().length > 0) return;

        fixHiddenFrames();
        enablePrivateChatOnS4();
        checkAdminEntry();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // تشغيل أولي فور حقن السكربت
    fixHiddenFrames();
    enablePrivateChatOnS4();
    checkAdminEntry();

    console.log("✅ Script Loaded: Fixed Blue Names, Forced Hidden Users Visibility, Active Admin & PM Alerts.");
})();
