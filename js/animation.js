$(document).ready(() => {

    const navHeight = $("nav").height()
    $(window).on("scroll", () => {
        let windowScroll = window.scrollY
        if(windowScroll > navHeight){
            $("nav").css("box-shadow","0 4px 6px rgb(0,0,0,.1)")
        } else {
            $("nav").css("box-shadow","0 0px 0px rgb(0,0,0,.1)")            
        }
        if(windowScroll > 200){
            $("#up-button").css("transform","translateY(0)")
        }
        else{
            $("#up-button").css("transform","translateY(80px)")
        }
    })

    $("#go-to-up-button").click(() => {
        window.scrollTo({
            top : 0,
            behavior : "smooth"
        })
    })
})

$(document).ready(() => {

    let isTextAppear = true
    const toggleTitle = () => {
        if(isTextAppear){
            $("#main-title2").addClass("opacity-0 translate-y-5")
            setTimeout(() => {
                $("#main-title1").removeClass("opacity-0 translate-y-5")
            },500)
        }
        else {
            $("#main-title1").addClass("opacity-0 translate-y-5")
            setTimeout(() => {
                $("#main-title2").removeClass("opacity-0 translate-y-5")
            },500)
        }
        isTextAppear = !isTextAppear
    }
    toggleTitle()
    setInterval(toggleTitle,5000)
})
