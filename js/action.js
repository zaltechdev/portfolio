$(document).ready(() => {
    $("#toggle-mobile-menu-dropdown").click(() => {
        $("#toggle-mobile-menu-dropdown").toggleClass("fa-bars")
        $("#toggle-mobile-menu-dropdown").toggleClass("fa-xmark")
        if($("#toggle-mobile-menu-dropdown").hasClass("fa-bars")){
            $("#menu-bar").addClass("hidden").removeClass("flex")
        } else {
            $("#menu-bar").addClass("flex").removeClass("hidden")
        }
    })
})