javascript:(function() {
    // 1. استخراج الهاش والبيانات
    function getUserHash(el) {
        let topic = el.querySelector('.u-topic')?.innerText?.trim();
        return topic || el.getAttribute('data-hash') || "Reading..";
    }

    // 2. نظام التنبيهات المركزي (V8)
    function showEliteToast(title, msg, user = {}) {
        let container = document.getElementById("mobile-toast-container") || (function() {
            let c = document.createElement("div");
            c.id = "mobile-toast-container";
            c.style = "position:fixed; top:20%; left:50%; transform:translateX(-50%); width:320px; z-index:1000000; pointer-events:none;";
            document.body.appendChild(c);
            return c;
        })();

        let toast = document.createElement("div");
        toast.style = "background:#f8f9fa; border:2px dashed #333; border-radius:12px; padding:12px; margin-bottom:10px; direction:rtl; text-align:right; box-shadow:0 5px 15px rgba(0,0,0,0.4); pointer-events:auto; border-right: 5px solid #c00;";
        
        const siteIcon = location.origin + "/favicon.ico";
        const displayImg = user.pic && user.pic !== "" ? user.pic : siteIcon;

        toast.innerHTML = `
            <div style="font-weight:bold; text-align:center; border-bottom:1px solid #ddd; margin-bottom:8px; color:#333;">📢 ${title}</div>
            <div style="display:flex; align-items:center; gap:10px">
                <img src="${displayImg}" style="width:45px; height:45px; border-radius:50%; border:1px solid #333; background:#fff">
                <div style="flex-grow:1">
                    <div style="font-weight:bold; color:#c00; font-size:15px;">${user.name || 'نظام'}</div>
                    <div style="font-size:10px; color:#007bff;">ID: ${user.hash || '..'}</div>
                </div>
            </div>
            <div style="margin-top:10px; padding:8px; background:#eee; border-radius:8px; text-align:center; font-weight:bold; font-size:13px;">${msg}</div>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 8000);
    }

    // 3. المحرك الشامل
    function mainEngine() {
        document.querySelectorAll('.uzr').forEach(el => {
            const nameNode = el.querySelector('.u-name');
            const name = nameNode?.innerText;
            const hash = getUserHash(el);
            const pic = el.querySelector('.u-pic')?.src;

            // أ- كشف المخفيين (جميع الرتب)
            const statImg = el.querySelector('img.ustat');
            if (statImg && statImg.src.includes('s4.png') && !el._seenHidden) {
                showEliteToast("تنبيه دخول مخفي", `قام ${name} بالدخول مخفي الآن`, {name, pic, hash});
                el._seenHidden = true;
            }

            // ب- كشف دخول الإدارة (أصحاب النجمة أو الكلاسات الإدارية)
            if ((el.classList.contains('admin') || el.innerHTML.includes('star.png')) && !el._seenAdmin) {
                showEliteToast("تنبيه إدارة", `دخل الإداري ${name} للروم`, {name, pic, hash});
                el._seenAdmin = true;
            }

            // ج- كشف المايك (أخذ وترك)
            const isOnMic = el.querySelector('img[src*="mic.png"]');
            if (isOnMic && !el._onMic) {
                showEliteToast("🎤 المايك", `${name} استلم المايك الآن`, {name, pic, hash});
                el._onMic = true;
            } else if (!isOnMic && el._onMic) {
                showEliteToast("🎤 المايك", `${name} ترك المايك`, {name, pic, hash});
                el._onMic = false;
            }

            // د- فتح البروفايل للمخفي وإظهار الهاش
            if (hash && !el._hashDone) {
                let hSpan = document.createElement('span');
                hSpan.innerText = ` [${hash}]`;
                hSpan.style = "font-size:9px; color:blue; font-weight:normal;";
                nameNode.appendChild(hSpan);
                el._hashDone = true;
                
                el.style.cursor = "help";
                el.addEventListener('click', (e) => {
                    e.stopImmediatePropagation();
                    const uid = [...el.classList].find(c => c.startsWith("uid"))?.slice(3);
                    if (uid && typeof openw === 'function') openw(uid);
                }, true);
            }
        });
    }

    // 4. مراقبة الخاص والتنبيهات العامة (MutationObserver)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    const txt = node.innerText || "";
                    if (txt.includes("رسالة خاصة") || node.classList.contains('priv')) {
                        showEliteToast("✉️ خاص", "وصلتك رسالة خاصة جديدة أو تنبيه");
                    }
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(mainEngine, 2000);
    showEliteToast("تم التشغيل", "السكربت V8 يعمل ويراقب المايك والإدارة والمخفيين");
})();
