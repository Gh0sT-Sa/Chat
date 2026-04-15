javascript:(function() {
    // 1. نظام التنبيهات (Toast)
    var radarContainer = document.getElementById("radar-alerts") || (function() {
        var c = document.createElement("div");
        c.id = "radar-alerts";
        c.style = "position:fixed; top:10%; left:50%; transform:translateX(-50%); width:300px; z-index:1000000; pointer-events:none; font-family:arial;";
        document.body.appendChild(c);
        return c;
    })();

    function sendRadarAlert(title, content, color = "#333") {
        var a = document.createElement("div");
        a.style = `background:#fff; border-right:6px solid ${color}; border-radius:5px; padding:10px; margin-bottom:5px; box-shadow:0 4px 10px rgba(0,0,0,0.3); direction:rtl; text-align:right; pointer-events:auto; font-size:13px;`;
        a.onclick = () => a.remove();
        a.innerHTML = `<b style="color:${color}">${title}</b><br>${content}`;
        radarContainer.appendChild(a);
        setTimeout(() => { if(a) a.remove(); }, 10000);
    }

    // 2. المحرك الرئيسي (يراقب القائمة d2 والأسماء)
    function startRadarEngine() {
        // --- أ: كشف المخفيين وإصلاح الإطارات (المزايا القديمة) ---
        document.querySelectorAll('.uzr').forEach(el => {
            const img = el.querySelector('img.ustat');
            const isHidden = img && img.src.includes('s4.png');
            
            // إصلاح الألوان والإطارات (ahmed, mhmood, الخ)
            ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(c => {
                if (el.classList.contains(c)) {
                    el.classList.remove(c);
                    el.style.width = el.style.height = '';
                }
            });

            // تفعيل فتح البروفايل للمخفي
            if (isHidden && !el._s4Active) {
                el.style.cursor = "pointer";
                el.title = "اضغط لفتح البروفايل (كاشف)";
                el.addEventListener('click', function(e) {
                    e.stopImmediatePropagation();
                    var uid = [...el.classList].find(c => c.startsWith('uid'))?.slice(3);
                    if(uid && typeof openw === 'function') openw(uid);
                });
                if(!el._notified) {
                    var name = el.querySelector('.u-topic')?.innerText || "عضو";
                    sendRadarAlert("🕵️ دخول مخفي", `قام <b>${name}</b> بالدخول كمخفي.`, "#555");
                    el._notified = true;
                }
                el._s4Active = true;
            }

            // --- ب: تنبيه دخول الإداري للروم ---
            if (el.classList.contains('inroom') && !el._adminNotified) {
                const isAdmin = el.querySelector('.u-ico[src*="admin"], .u-ico[src*="mod"], .label-primary');
                if (isAdmin) {
                    var name = el.querySelector('.u-topic')?.innerText || "إداري";
                    sendRadarAlert("🛡️ دخول إداري", `الإداري <b>${name}</b> متواجد الآن في الروم.`, "#007bff");
                    el._adminNotified = true;
                }
            }
        });

        // --- ج: رصد رسائل الخاص (المرسل، المستقبل، النص) ---
        document.querySelectorAll('#d2 .uhtml').forEach(msg => {
            if (msg._checked) return;
            if (msg.innerText.includes("رسالة خاصة")) {
                var sender = msg.querySelector('.u-topic')?.innerText || "مرسل مجهول";
                var uid = [...msg.classList].find(c => c.startsWith('uid'))?.slice(3) || "---";
                var text = msg.querySelector('.u-msg')?.innerText || "النص مخفي";
                
                sendRadarAlert("✉️ رصد خاص", `<b>من:</b> ${sender} (${uid})<br><b>النص:</b> ${text}`, "#e83e8c");
            }
            msg._checked = true;
        });
    }

    // 3. المراقبة اللحظية (Observer)
    const observer = new MutationObserver(startRadarEngine);
    observer.observe(document.body, { childList: true, subtree: true });

    // تشغيل احتياطي كل ثانية
    setInterval(startRadarEngine, 1000);

    console.log("🚀 Elite Radar V16 Loaded Successfully");
    sendRadarAlert("الرادار المطور V16", "تم تفعيل كافة المزايا (المخفي، الإدارة، والخاص).", "#28a745");
})();
