javascript:(function() {
    try {
        // إجبار النظام على كشف الرتب العليا المخفية (تجاوز حماية الشات)
        if (typeof window.minL !== 'undefined') { window.minL = -7777; }
        if (typeof window.showpics !== 'undefined') { window.showpics = -1; }

        // 1) نظام التنبيهات
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
            
            toast.innerHTML = 
                "<div style='font-weight:bold;text-align:center;margin-bottom:8px;color:" + titleColor + ";font-size:14px;'>🔔 " + title + "</div>" +
                "<div style='display:flex;align-items:center;gap:8px'>" +
                    "<img src='" + user.pic + "' style='width:35px;height:35px;border-radius:50%;border:1px solid #ccc'>" +
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
                pic: picEl ? picEl.src : "pic.png",
                ico: icoEl ? icoEl.src : ""
            };
        }

        // 2) إصلاح الإطارات (منع الكلاسات المزعجة)
        function fixHiddenFrames() {
            var users = document.querySelectorAll('.uzr');
            for (var i = 0; i < users.length; i++) {
                var el = users[i];
                if (!el._patched) {
                    var originalAdd = el.classList.add;
                    el.classList.add = function() {
                        var args = Array.prototype.slice.call(arguments);
                        if (args.indexOf('__rv_me') !== -1) return;
                        originalAdd.apply(this, args);
                    };
                    el._patched = true;
                }
                
                var badClasses = ['ahmed', 'mhmood', '__rv_me', 'custom-alaw'];
                for (var j = 0; j < badClasses.length; j++) {
                    if (el.classList.contains(badClasses[j])) {
                        el.classList.remove(badClasses[j]);
                        el.style.width = ''; 
                        el.style.height = '';
                    }
                }
            }
        }

        // 3) إظهار جميع المخفيين + التنبيه + فتح البروفايل (التي نجحت)
        function handleHiddenUsers() {
            var users = document.querySelectorAll('#users .uzr');
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                
                // إجبار النظام على إظهار العضو في القائمة (لحل مشكلة الرتب العليا)
                if (user.style.display === 'none') {
                    user.style.display = 'block';
                }

                var img = user.querySelector('img.ustat');
                if (!img || img.getAttribute('src').indexOf('s4.png') === -1) continue;
                
                // ميزة فتح البروفايل بنجاح
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

                // التنبيه بالمخفي
                if (!user._hiddenAlerted) {
                    showCustomToast("دخول مخفي للروم", getUInfo(user), "قام العضو بالدخول بوضعية التخفي 🕵️", "hidden");
                    user._hiddenAlerted = true;
                }
            }
        }

        // 4) تنبيه دخول الإداري للروم (اعتماداً على الأيقونات الحقيقية للإدارة)
        function checkAdminEntry() {
            var inRoomUsers = document.querySelectorAll('#users .uzr.inroom');
            for (var i = 0; i < inRoomUsers.length; i++) {
                var el = inRoomUsers[i];
                if (el._adminAlerted) continue;
                
                // نبحث عن أيقونات الإدارة المعتمدة في النظام a1, a2, a3.. أو mod
                var adminIcon = el.querySelector('img[src*="a1.png"], img[src*="a2.png"], img[src*="a3.png"], img[src*="a4.png"], img[src*="a5.png"], img[src*="admin"], img[src*="mod"]');
                var adminLabel = el.querySelector('.label-primary');

                if (adminIcon || adminLabel) {
                    showCustomToast("دخول إداري للروم", getUInfo(el), "إداري متواجد الآن في الروم 🛡️", "admin");
                    el._adminAlerted = true;
                }
            }
        }

        // 5) رصد الرسائل الخاصة الحقيقية فقط (تجاهل الإعلانات)
        function checkPrivateMessages() {
            // نستهدف فقط الحاويات الفعلية للخاص (#chats) أو رسائل الهمس المباشرة (.priv)
            var privateMessages = document.querySelectorAll('#chats .uzr, #d2 .uzr.priv');
            for (var i = 0; i < privateMessages.length; i++) {
                var msgNode = privateMessages[i];
                if (msgNode._pmAlerted) continue;
                
                // التأكد أنها ليست إعلاناً (إعلانات الشات تأخذ كلاس pmsgc أو ppmsgc)
                if (!msgNode.classList.contains('pmsgc') && !msgNode.classList.contains('ppmsgc')) {
                    var senderInfo = getUInfo(msgNode);
                    var msgContentEl = msgNode.querySelector('.u-msg');
                    var msgContent = msgContentEl ? msgContentEl.innerText : msgNode.innerText.replace('رسالة خاصة', '').trim();
                    
                    showCustomToast("رسالة خاصة جديدة", senderInfo, "<b>النص:</b> <span style='color:#e83e8c;'>" + msgContent + "</span>", "pm");
                }
                msgNode._pmAlerted = true;
            }
        }

        // المحرك الأساسي
        function runAllEngines() {
            fixHiddenFrames();
            handleHiddenUsers();
            checkAdminEntry();
            checkPrivateMessages();
        }

        // تشغيل أولي
        runAllEngines();

        // 6) المراقبة الشاملة (Observer)
        var observer = new MutationObserver(function() {
            var searchBox = document.getElementById('usearch');
            if (searchBox && searchBox.value.trim().length > 0) return;
            runAllEngines();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        console.log("✅ Elite Script V17 Loaded. No Errors. All features active.");

    } catch (err) {
        console.error("حدث خطأ في السكربت: ", err);
    }
})();
