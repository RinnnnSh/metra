$(document).ready(function () {
  $("form[method='post'], li form").each(function () {
    var form = $(this);
    var submitForm = form.find("input[type='submit'],button");
    //submitForm.attr({"disabled": true});
    //submitForm.css({"opacity": 0.5});
    form.append('<div class="policy-check"><input class="policy-checkbox" type="checkbox" checked> <span>Я принимаю <a href="http://www.metra.ru/politika-konfidencialnosti.html" target="_blank">политику конфиденциальности</a></span></div>');
    var policyCheckbox = form.find(".policy-checkbox");
    policyCheckbox.on("change",function () {
      var checked = policyCheckbox.prop("checked");
      if(checked) {
        submitForm.attr({"disabled": false});
        submitForm.css({"opacity": 1});
      }
      else {
        submitForm.attr({"disabled": true});
        submitForm.css({"opacity": 0.5});
      }
    });
  });
});