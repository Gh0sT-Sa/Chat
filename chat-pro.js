javascript:(function() {
    // 1. نظام التنبيهات المطور (Master Toast)
    function showMasterToast(title, msg, user = {}) {
        let container = document.getElementById("mobile-toast-container") || (function() {
            let c = document.createElement("div");
            c.id = "mobile-toast-container";
            c.style = "position:fixed; top:15%; left:50%; transform:translateX(-50%); width:330px; z-index:1000000; pointer-events:none;";
            document.body.appendChild(c);
            return c;
        })();

        let toast = document.createElement("div");
        toast.style = "background:#fff; border:2px solid #333; border-radius:12px; padding:12px; margin-bottom:10px; direction:rtl; text-align:right; box-shadow:0 6px 20px rgba(0,0,0,0.5); pointer-events:auto; border-right: 8px solid #007bff;";
        
        const siteIcon = location.origin + "/favicon.ico";
        const displayImg = user.pic && user.pic !== "" ? user.pic : siteIcon;

        toast.innerHTML = `
            <div style="font-weight:bold; text-align:center; border-bottom:1px solid #ccc; margin-bottom:8px; color:#007bff; font-size:15px;">📢 ${title}</div>
            <div style="display:flex; align-items:center; gap:10px">
                <img src="${displayImg}" style="width:45px; height:45px; border-radius:50%; border:1px solid #333; background:#fff">
                <div style="flex-grow:1">
                    <div style="font-weight:bold; color:#c00; font-size:14px;">${user.name || 'النظام'}</div>
                    <div style="font-size:10px; color:#555;">${user.hash || ''}</div>
                </div>
            </div>
            <div style="margin-top:10px; padding:10px; background:#f1f1f1; border-radius:8px; font-size:13px; color:#000; line-height:1.4; border:1px solid #ddd;">
                ${msg}
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => { if(toast) toast.remove(); }, 12000);
    }

    // 2. محرك مراقبة الرسائل الخاصة (سحب المحتوى)
    const privateObserver = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    // التحقق من كونه عنصر رسالة (غالباً بكلاس msg أو داخل d2)
                    const isPrivate = node.classList.contains('priv') || node.innerHTML.includes('label-warning') || node.innerText.includes('رسالة خاصة');
                    
                    if (isPrivate) {
                        // استخراج اسم المرسل
                        const sender = node.querySelector('.unme, .u-name')?.innerText || "مجهول";
                        // استخراج نص الرسالة بالكامل
                        const messageText = node.innerText.replace("رسالة خاصة", "").trim();
                        // استخراج الصورة إذا وجدت
                        const senderPic = node.querySelector('img.u-pic, img.avatar')?.src || "";

                        // عرض التنبيه مع محتوى الرسالة
                        showMasterToast("✉️ كشف محادثة خاصة", messageText, { name: sender, pic: senderPic });
                        
                        // تسجيل في الكونسول للتوثيق
                        console.log(`%c [خاص] من: ${sender} | النص: ${messageText}`, "color: white; background: red; font-weight: bold;");
                    }
                }
            });
        });
    });

    // 3. المحرك الدوري (الهاشات والمخفيين)
    function coreEngineV11() {
        document.querySelectorAll('.uzr').forEach(el => {
            const nameNode = el.querySelector('.u-name');
            const hash = el.getAttribute('data-hash') || el.querySelector('.u-topic')?.innerText?.trim();

            // حقن الهاش
            if (hash && hash.length > 3 && !el._hashAdded) {
                let span = document.createElement('span');
                span.innerText = ` [${hash}]`;
                span.style = "font-size:10px; color:blue; font-weight:bold; margin-right:5px; background:#d1ecf1; border-radius:3px;";
                nameNode?.appendChild(span);
                el._hashAdded = true;
            }

            // كشف المخفي (S4)
            const statImg = el.querySelector('img.ustat');
            if (statImg && statImg.src.includes('s4.png') && !el._seenHidden) {
                showMasterToast("🕵️ مخفي متصل", "العضو متواجد الآن بشكل مخفي في القائمة", { name: nameNode?.innerText, hash: hash });
                el._seenHidden = true;
            }
        });
    }

    // تشغيل المراقبين
    const chatBody = document.getElementById('d2') || document.body;
    privateObserver.observe(chatBody, { childList: true, subtree: true });
    setInterval(coreEngineV11, 2000);

    console.log("✅ Elite V11: Private Spy Mode Active");
    showMasterToast("تم التفعيل V11", "السكربت الآن يسحب محتوى الرسائل الخاصة ويراقب الهاشات.");
})();
