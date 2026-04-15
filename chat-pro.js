javascript: (function() {

    // ==== [ إعدادات إضافة أصدقاء VIP ] ====
    // ضع هاشات أصدقائك هنا بين علامات التنصيص، افصل بينها بفاصلة
    const myVIPHashes = [
        "12345678", 
        "ABCDEFGH", 
        "HASH3HERE"
    ];
    // =======================================

    // (باقي دوالك الأساسية كما هي تماماً - لم يتم تعديلها)
    
    function showToast(user) {
        const toast = document.createElement("div");
        toast.onclick = () => toast.remove();
        toast.style = "background:#f0f0f0;border:2px solid #333;border-radius:10px;padding:10px;margin-top:10px;max-width:280px;font-family:sans-serif;color:#000;box-shadow:0 2px 6px rgba(0,0,0,.2);cursor:pointer;text-align:left";
        toast.innerHTML = `
          <div style="font-weight:bold;text-align:center;margin-bottom:8px">🔔 تنبيه</div>
          <div style="display:flex;align-items:center;gap:8px">
            <img src="${user.pic}" style="width:32px;height:32px;border-radius:50%;border:1px solid #ccc">
            ${user.icon ? `<img src="${user.icon}" style="height:20px">` : ""}
            <div style="flex-grow:1">
              <div style="font-weight:bold">${user.name}</div>
              <div style="font-size:12px;color:gray">${user.hash}</div>
            </div>
          </div>
          <div style="margin-top:10px;padding:8px;background:#e0e0e0;border-radius:6px;text-align:center;font-weight:bold">دخل مخفي للروم</div>
        `;
        document.getElementById("mobile-toast-container").appendChild(toast);
    }

    // (دوالم الأساسية هنا: showUsers, showAllHigherRanksOnlyHidden... إلخ)
    
    function fixHiddenFrames() {
        document.querySelectorAll('.uzr').forEach(el => {
            // إزالة الكلاسات المزعجة
            ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(cls => {
                if (el.classList.contains(cls)) {
                    el.classList.remove(cls);
                    el.style.width = '';
                    el.style.height = '';
                }
            });
            // إصلاح التوبيك
            const topic = el.querySelector('.u-topic');
            if (topic) {
                topic.style.width = '';
                topic.style.maxWidth = '100%';
            }
        });
    }

    function enablePrivateChatOnS4() {
        document.querySelectorAll('#users .uzr').forEach(user => {
            const img = user.querySelector('img.ustat');
            if (!img || !img.getAttribute('src').includes('s4.png')) return;
            
            user.style.cursor = "pointer";
            if (!user._privateBound) {
                user.addEventListener("click", function(e) {
                    e.stopPropagation();
                    const uidClass = [...user.classList].find(c => c.startsWith("uid"));
                    const userId = uidClass ? uidClass.slice(3) : null;
                    if (userId && typeof openw === "function") {
                        openw(userId, true);
                        console.log("✅ تم فتح المحادثة مع:", userId);
                    } else {
                        console.warn("❌ لم يتم العثور على uid أو الدالة غير موجودة");
                    }
                });
                user._privateBound = true;
            }
        });
    }


    // 🌟 [ الإضافة الجديدة: دالة تمييز الأصدقاء بالهاش ] 🌟
    function highlightVIPUsers() {
        // إذا لم تكن هناك هاشات مضافة، لا تفعل شيئاً
        if (myVIPHashes.length === 0) return;

        document.querySelectorAll('.uzr').forEach(userEl => {
            // منع التكرار (لكي لا يضيف النجمة أكثر من مرة)
            if (userEl._vipPatched) return;

            // استخراج النص الكامل من عنصر المستخدم للبحث عن الهاش بداخله
            const userText = userEl.textContent || "";
            
            // فحص ما إذا كان النص يحتوي على أي من هاشات الـ VIP
            const isVIP = myVIPHashes.some(hash => userText.includes(hash));

            if (isVIP) {
                // 1. تغيير لون الخلفية للإبراز (لون ذهبي خفيف جداً)
                userEl.style.backgroundColor = "#fffde7"; 
                // 2. إضافة إطار جانبي مميز
                userEl.style.borderRight = "4px solid #ffd700"; 
                
                // 3. إضافة أيقونة نجمة لاسم المستخدم (عادة الاسم يكون داخل u-msg)
                const nameEl = userEl.querySelector('.u-msg') || userEl;
                if (nameEl && !nameEl.innerHTML.includes('⭐')) {
                    // حقن النجمة قبل الاسم
                    nameEl.innerHTML = '<span style="color:#ffd700; text-shadow: 0 0 2px #000;">⭐</span> ' + nameEl.innerHTML;
                }
                
                // تحديد العنصر كـ "معالج" لكي لا تتكرر العملية
                userEl._vipPatched = true;
                console.log("🌟 تم تمييز صديق/VIP في القائمة!");
            }
        });
    }


    // 7) مراقبة DOM
    new MutationObserver(() => {
        const searchBox = document.getElementById('usearch');
        if (searchBox && searchBox.value.trim().length > 0) return;

        // استدعاء الدوال الأساسية
        // showUsers(); // (إذا كانت موجودة في كودك الأصلي)
        // showAllHigherRanksOnlyHidden(); // (إذا كانت موجودة في كودك الأصلي)
        fixHiddenFrames();
        // checkHiddenUsers(); // (إذا كانت موجودة في كودك الأصلي)
        enablePrivateChatOnS4();
        
        // استدعاء الدالة الجديدة مع التحديثات
        highlightVIPUsers();
        
    }).observe(document.body, {
        childList: true,
        subtree: true
    });

    // تشغيل أولي
    // showUsers();
    // showAllHigherRanksOnlyHidden();
    fixHiddenFrames();
    // checkHiddenUsers();
    enablePrivateChatOnS4();
    
    // تشغيل الدالة الجديدة لأول مرة
    highlightVIPUsers();

    console.log("✅ تم التفعيل بنجاح شامل إضافة تمييز الأصدقاء (VIP)!");
})();
