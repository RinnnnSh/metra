function sendCatalogSubscribe(e){
    e.preventDefault();
    var $target = $(e.target);
    $.ajax({
        url: '/custom/mailsender.php?type=catalog',
        data: $target.serialize(),
        type: "POST",
        success: function(response){
            console.log(response);
            console.log($target.serialize());
            $(".catalog-subscribe__form").html("Ваша заявка отправлена");
        },
        error: function(jXHR,error){
            console.log(error);
        }
    });
}