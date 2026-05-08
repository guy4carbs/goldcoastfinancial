(function () {
  function init() {
    var sms = document.getElementById('sms-link');
    var msg = document.getElementById('msg');
    if (!sms || !msg) return;
    function update() {
      sms.href = 'sms:+13125608885?body=' + encodeURIComponent(msg.value);
    }
    msg.addEventListener('input', update);
    update();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
