var Toast = (function () {
  var toastsList = [];
  function init(){
    $(document).ready(function () {
      $("body").append('<div class="toast-container"></div>');
      $("head").append('<link rel="stylesheet" href="/custom/toast.css">');
    });
  }
  var defaultValue = function (checkedValue,defaultValue) {
    return (checkedValue != undefined) ? checkedValue : defaultValue;
  };
  var ToastItem = function (params) {
    var toast = this;
    toast.id = toastsList.length;
    toast.title = params.title;
    toast.content = params.content;
    toast.type = params.type;
    toast.timeout = params.timeout;
    toast.getElement = function () {
      return $("#toast-" + toast.id);
    };
    toast.destroy = function () {
      toast.element.css({
        opacity: "0",
        right: "-150%"
      });
      setTimeout(function () {
        toast.getElement().remove();
        delete toastsList[toast.id];
      },500);

    };
    toast.show = function () {
      var htmlContainer = $(".toast-container");
      toast.element = htmlContainer.prepend('<div class="toast ' + defaultValue(toast.type,"ok") + '" id="toast-' + toast.id + '"><div class="toast-title">' + toast.title + '</div><div class="toast-content">' + toast.content + '</div></div>').find("#toast-" + toast.id);
      setTimeout(function () {
        toast.element.css({
          right: "0",
          marginBottom: "5px",
          lineHeight: "20px",
          color: "white"
        });
      },20);

      toast.getElement().on("click",function () {
        toast.destroy();
      });
      setTimeout(toast.destroy,defaultValue(toast.timeout,5000));
    };
  };
  init();

  return {
    createToast: function (contentParams,configParams) {
      var toast = new ToastItem(contentParams);
      toastsList.push(toast);
      toast.show();
    },
    clearToasts: function (params) {
      toastsList.forEach(function (item, i, arr) {
        item.destroy();
      });
    },
    getToastsList: function () {
      return toastsList;
    }
  };
}());
