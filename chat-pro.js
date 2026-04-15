javascript:(function() {
    try {
        // إجبار النظام على كشف الرتب العليا المخفية
        window.minL = -7777;
        window.minR = -7777;
        window.showpics = -1;

        // ذاكرة لحفظ من تم التنبيه عنهم (لمنع التقطع أو التكرار)
        const alertedHidden = new Set();
        const alertedAdmin = new Set();

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
            
            return {
                name: nameEl ? nameEl.innerText : "مجهول",
                hash: uidMatch ? uidMatch.slice(3) : "غير معروف",
                pic: picEl ? picEl.src : "",
                ico: icoEl ? icoEl.src : ""
            };
        }

        // 2) إصلاح الإطارات
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
                    if (el.classList.contains(cls)) { el.classList.remove(cls); el.style.width = ''; el.style.height = ''; }
                });
            });
        }

        // 3) كشف المخفيين (بالاعتماد على دوال سكربتك الأصلي لإظهار الرتب العليا)
        function handleHiddenUsers() {
            // محاولة تشغيل دوال موقع الشات المسؤولة عن كشف الرتب العليا
            try { if(typeof showUsers === 'function') showUsers(); } catch(e){}
            try { if(typeof showAllHigherRanksOnlyHidden === 'function') showAllHigherRanksOnlyHidden(); } catch(e){}

            document.querySelectorAll('#users .uzr').forEach(function(user) {
                // فرض الظهور بالقوة في القائمة
                if (user.style.display === 'none' || user.classList.contains('hid')) {
                    user.style.setProperty('display', 'block', 'important');
                    user.classList.remove('hid', 'hidden');
                }

                var img = user.querySelector('img.ustat');
                if (!img || img.getAttribute('src').indexOf('s4.png') === -1) return;
                
                var uInfo = getUInfo(user);

                // فتح البروفايل
                user.style.cursor = "pointer";
                if (!user._privateBound) {
                    user.addEventListener("click", function(e) {
                        e.stopImmediatePropagation();
                        if (uInfo.hash && uInfo.hash !== "غير معروف" && typeof openw === "function") {
                            openw(uInfo.hash);
                        }
                    });
                    user._privateBound = true;
                }

                // تنبيه المخفي باستخدام الذاكرة لمنع التقطع
                if (!alertedHidden.has(uInfo.hash)) {
                    showCustomToast("دخول مخفي للروم", uInfo, "قام العضو بالدخول بوضعية التخفي 🕵️", "hidden");
                    alertedHidden.add(uInfo.hash);
                }
            });
        }

        // 4) تنبيه دخول الإداري (رصد عن طريق أيقونات الشات الأصلية)
        function checkAdminEntry() {
            document.querySelectorAll('#users .uzr').forEach(function(el) {
                var uInfo = getUInfo(el);
                if (alertedAdmin.has(uInfo.hash)) return;

                var icoSrc = uInfo.ico.toLowerCase();
                var isManager = icoSrc.includes('a1.png') || icoSrc.includes('a2.png') || 
                                icoSrc.includes('a3.png') || icoSrc.includes('a4.png') || 
                                icoSrc.includes('a5.png') || icoSrc.includes('admin') || 
                                icoSrc.includes('mod') || el.classList.contains('label-primary');

                if (isManager) {
                    showCustomToast("دخول إداري للروم", uInfo, "إداري متواجد الآن في الروم 🛡️", "admin");
                    alertedAdmin.add(uInfo.hash);
                }
            });
        }

        // 5) الرصد الجذري للرسائل الخاصة (يصطاد المحادثة الفردية الفعلية)
        function observePrivateMessages() {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(m) {
                    m.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && node.classList && node.classList.contains('uzr')) {
                            
                            // 1. فلترة إعلانات الشات تماماً
                            if (node.classList.contains('pmsgc') || node.classList.contains('ppmsgc') || (node.innerText && node.innerText.includes('إعلان'))) return;

                            // 2. التحقق مما إذا كانت الرسالة داخل الخاص الفعلي (#chats) أو همس (.priv)
                            var inChatsBox = node.closest && node.closest('#chats');
                            var isWhisper = node.classList.contains('priv') || (node.innerText && node.innerText.includes('رسالة خاصة'));

                            if (inChatsBox || isWhisper) {
                                if (node._pmAlerted) return;
                                node._pmAlerted = true;

                                var senderInfo = getUInfo(node);
                                var msgEl = node.querySelector('.u-msg');
                                var msgText = msgEl ? msgEl.innerText : node.innerText.replace('رسالة خاصة', '').trim();

                                showCustomToast("رسالة خاصة 💬", senderInfo, "<b style='color:#e83e8c'>" + msgText + "</b>", "pm");
                            }
                        }
                    });
                });
            });
            // المراقبة تتم على كامل الموقع لعدم تفويت أي نافذة خاص تُفتح
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // تشغيل الوظائف
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

        // تفعيل أوّلي
        runAllEngines();
        observePrivateMessages(); // تشغيل مراقب الخاص الجذري

        // 7) رسالة التحقق
        showCustomToast("✅ نجاح التحميل", {name: "الرادار V19", hash: "System", pic: "", ico: ""}, "<b>تم التفعيل بنجاح:</b><br>✔️ كشف المخفي (لجميع الرتب)<br>✔️ تنبيه الإدارة<br>✔️ رصد المحادثات الخاصة الفردية<br>✔️ إصلاح الإطارات وفتح البروفايل", "admin");

    } catch (err) {
        alert("حدث خطأ في تحميل الرادار.");
        console.error(err);
    }
})();
