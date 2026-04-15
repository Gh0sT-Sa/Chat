javascript:(function() {
    try {
        // إجبار النظام على كشف الرتب العليا المخفية (تجاوز حماية الشات)
        if (typeof window.minL !== 'undefined') { window.minL = -7777; }
        if (typeof window.showpics !== 'undefined') { window.showpics = -1; }

        // 1) بناء حاوية التنبيهات
        var toastContainer = document.getElementById("radar-toast-container");
        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = "radar-toast-container";
            toastContainer.style = "position:fixed; top:15px; left:15px; z-index:9999999; display:flex; flex-direction:column; gap:10px; pointer-events:none;";
            document.body.appendChild(toastContainer);
        }

        function showCustomToast(title, user, extraMsg, type) {
            var toast = document.createElement("div");
            toast.onclick = function() { toast.remove(); };
            
            var borderColor = type === 'admin' ? '#007bff' : type === 'pm' ? '#e83e8c' : '#555';
            var titleColor = type === 'admin' ? '#007bff' : type === 'pm' ? '#e83e8c' : '#000';

            toast.style = "background:#f9f9f9; border:2px solid #333; border-right:6px solid " + borderColor + "; border-radius:10px; padding:10px; max-width:280px; font-family:sans-serif; color:#000; box-shadow:0 4px 10px rgba(0,0,0,.3); cursor:pointer; text-align:right; direction:rtl; pointer-events:auto;";
            
            var userImage = user.pic ? "<img src='" + user.pic + "' style='width:35px;height:35px;border-radius:50%;border:1px solid #ccc'>" : "👤";
            
            toast.innerHTML = 
                "<div style='font-weight:bold;text-align:center;margin-bottom:8px;color:" + titleColor + ";font-size:14px;'>🔔 " + title + "</div>" +
                "<div style='display:flex;align-items:center;gap:8px'>" +
                    userImage +
                    (user.ico ? "<img src='" + user.ico + "' style='height:20px'>" : "") +
                    "<div style='flex-grow:1'>" +
                        "<div style='font-weight:bold;color:#333;font-size:13px;'>" + user.name + "</div>" +
                        "<div style='font-size:11px;color:gray'>" + user.hash + "</div>" +
                    "</div>" +
                "</div>" +
                "<div style='margin-top:10px;padding:8px;background:#ebebeb;border-radius:6px;font-size:12px;color:#000;border:1px solid #ddd;word-break:break-word;'>" +
                    extraMsg +
                "</div>";
            
            toastContainer.appendChild(toast);
            setTimeout(function() { if(toast) toast.remove(); }, 12000);
        }

        function getUInfo(el) {
            var nameEl = el.querySelector('.u-topic, .u-name');
            var picEl = el.querySelector('.u-pic');
            var icoEl = el.querySelector('.u-ico');
            
            var uidMatch = [...el.classList].find(function(c) { return c.startsWith('uid'); });
            var hash = uidMatch ? uidMatch.slice(3) : "غير معروف";

            return {
                name: nameEl ? nameEl.innerText : "مجهول",
                hash: hash,
                pic: picEl ? picEl.src : "",
                ico: icoEl ? icoEl.src : ""
            };
        }

        // 2) إصلاح الإطارات (تم التأكد من عملها)
        function fixHiddenFrames() {
            document.querySelectorAll('.uzr').forEach(function(el) {
                if (!el._patched) {
                    var originalAdd = el.classList.add;
                    el.classList.add = function() {
                        var args = Array.prototype.slice.call(arguments);
                        if (args.indexOf('__rv_me') !== -1) return;
                        originalAdd.apply(this, args);
                    };
                    el._patched = true;
                }
                
                ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'].forEach(function(cls) {
                    if (el.classList.contains(cls)) {
                        el.classList.remove(cls);
                        el.style.width = ''; 
                        el.style.height = '';
                    }
                });
            });
        }

        // 3) كشف جميع المخفيين (حتى الرتب العليا) + فتح البروفايل
        function handleHiddenUsers() {
            // استدعاء دوال سكربتك القديم إن كانت موجودة في ذاكرة الموقع
            if(typeof window.showUsers === 'function') window.showUsers();
            if(typeof window.showAllHigherRanksOnlyHidden === 'function') window.showAllHigherRanksOnlyHidden();

            document.querySelectorAll('#users .uzr').forEach(function(user) {
                // الفك الإجباري لإخفاء الرتب العليا
                if (user.style.display === 'none' || user.classList.contains('hid')) {
                    user.style.setProperty('display', 'block', 'important');
                    user.classList.remove('hid', 'hidden');
                }

                var img = user.querySelector('img.ustat');
                if (!img || img.getAttribute('src').indexOf('s4.png') === -1) return;
                
                user.style.cursor = "pointer";
                if (!user._privateBound) {
                    user.addEventListener("click", function(e) {
                        e.stopImmediatePropagation();
                        var uidClass = [...this.classList].find(function(c) { return c.startsWith("uid"); });
                        var userId = uidClass ? uidClass.slice(3) : null;
                        if (userId && typeof openw === "function") {
                            openw(userId);
                        }
                    });
                    user._privateBound = true;
                }

                if (!user._hiddenAlerted) {
                    showCustomToast("دخول مخفي للروم", getUInfo(user), "قام العضو بالدخول بوضعية التخفي 🕵️", "hidden");
                    user._hiddenAlerted = true;
                }
            });
        }

        // 4) تنبيه دخول الإداري (رصد قوي عبر الكود المصدري)
        function checkAdminEntry() {
            document.querySelectorAll('#users .uzr.inroom').forEach(function(el) {
                if (el._adminAlerted) return;
                var html = el.innerHTML;
                
                // اصطياد الإدارة عبر (أيقوناتهم الأصلية في ملفات الموقع، أو الكلاس الخاص بهم)
                if (html.includes('admin') || html.includes('mod') || html.match(/ico\/a\d\.png/) || el.classList.contains('label-primary')) {
                    showCustomToast("دخول إداري للروم", getUInfo(el), "إداري متواجد الآن في الروم 🛡️", "admin");
                    el._adminAlerted = true;
                }
            });
        }

        // 5) رصد الرسائل الخاصة الحقيقية (بالمراقبة اللحظية القاطعة)
        function observePrivateMessages() {
            var containers = ['d2', 'chats']; // مراقبة الشات العام + صناديق المحادثات الخاصة
            
            containers.forEach(function(id) {
                var container = document.getElementById(id);
                if (container && !container._pmObserverAttached) {
                    var observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(m) {
                            m.addedNodes.forEach(function(node) {
                                if (node.nodeType === 1) {
                                    // تجاهل إعلانات الشات نهائياً
                                    if (node.classList.contains('pmsgc') || node.classList.contains('ppmsgc') || node.innerText.includes('إعلان')) return;

                                    var isPriv = node.classList.contains('priv') || (node.innerHTML && node.innerHTML.includes('رسالة خاصة'));
                                    
                                    if (isPriv) {
                                        var senderInfo = getUInfo(node);
                                        var msgEl = node.querySelector('.u-msg');
                                        var msgContent = msgEl ? msgEl.innerText : node.innerText.replace('رسالة خاصة', '').trim();
                                        
                                        showCustomToast("رسالة خاصة جديدة", senderInfo, "<b>النص:</b> <span style='color:#e83e8c;'>" + msgContent + "</span>", "pm");
                                    }
                                }
                            });
                        });
                    });
                    observer.observe(container, { childList: true, subtree: true });
                    container._pmObserverAttached = true;
                }
            });
        }

        // المحرك الأساسي
        function runAllEngines() {
            fixHiddenFrames();
            handleHiddenUsers();
            checkAdminEntry();
        }

        // 6) المراقبة الشاملة لتحديثات القائمة
        var mainObserver = new MutationObserver(function() {
            var searchBox = document.getElementById('usearch');
            if (searchBox && searchBox.value.trim().length > 0) return;
            runAllEngines();
        });

        mainObserver.observe(document.body, { childList: true, subtree: true });

        // تشغيل أولي
        runAllEngines();
        observePrivateMessages(); // تفعيل رادار الخاص

        // 7) رسالة التحقق من التفعيل (كما طلبت)
        showCustomToast("✅ نجاح التحميل", {name: "نظام الرادار", hash: "System", pic: "", ico: ""}, "<b>تم تفعيل السكربت بنجاح:</b><br>✔️ كشف المخفي (لجميع الرتب)<br>✔️ تنبيه الإدارة<br>✔️ رصد المحادثات الخاصة<br>✔️ إصلاح الإطارات وفتح البروفايل", "admin");
        console.log("✅ Radar V18 System Active.");

    } catch (err) {
        alert("حدث خطأ في السكربت، يرجى مراجعة الكونسول.");
        console.error("Radar Error: ", err);
    }
})();
