$(document).ready(function () {
  var $form = $(".js-feedback-form");
  $form.each(function (i, item) {
    $(item).on("submit", function (e) {
      console.log(item);
      e.preventDefault();
      var data = $(item).serialize();
      var array = $(item).serializeArray();
      var query = {}; 
      array.forEach(item => query[item.name] = item.value);
      console.log(query);
      console.log("item", item);
      $(".feedback-form__field__button").prop("disabled", true);
      $(".feedback-form__field__button").html(`<img src="/custom/preloader.svg">`);
      $.ajax({
        type: "POST",
        url: "/ordercall2.php",
        data: data,
        success: function (resp) {
          setTimeout(function () {
            $.fancybox.close();
          }, 1500);
          console.log(resp);
          $form.html('<div style="padding: 20px;"><h1>Ваше сообщение успешно отправлено</h1></div>');
          $(".feedback-form__field__button").prop("disabled", false);
          
          Comagic.addOfflineRequest({name: query.name, email: query.email, phone: query.phone, message: query.message}); 
        },
        error: function (jqXHR, exception) {
          console.log(data);
          $(".feedback-form__field__button").prop("disabled", false);
          console.error(jqXHR, exception);
        }
      });
      $.ajax({
        type: "POST",
        url: "/custom/mailsender.php?type=feedback",
        data: data,
        success: function (response) {
          console.log("SUCCESS", response);
        }
      });
    });
  });
});
