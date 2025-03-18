$(document).ready(() => {
    // Global delay animation when reloaded first time
    setTimeout(() => {
        // Logo animation script
        $("#logo").removeClass("hidden")
        $("#logo").addClass("flex")
        setTimeout(() => {
            $("#logo").removeClass("opacity-0")
            $("#logo").removeClass("translate-y-7")
        },100)
        
        // Menu navbar animation one-by-one
        let delay = 100
        $("#menu-bar > a").each(function (index, element) {
            $(element).removeClass("hidden")
            $(element).addClass("flex")
            $(element).css("transition-delay",delay)
            setTimeout(() => {
                $(element).removeClass("opacity-0")
                $(element).removeClass("translate-y-10")    
                setTimeout(() => {
                    $(element).removeClass("duration-500")      
                    $(element).addClass("duration-150")      
                }, delay)
            },delay)
            delay += 75
        });

        $("#follow-social-jombotron > a").each(function (index, element) {
            $(element).css("transition-delay",delay)
            setTimeout(() => {
                $(element).removeClass("opacity-0")
                $(element).removeClass("translate-y-10")    
                setTimeout(() => {
                    $(element).removeClass("duration-500")      
                    $(element).removeClass("delay-[1200ms]")          
                }, delay)
            },delay)
            delay += 75
        });

        setTimeout(() => {
            $("#im-a-title,#intro-msg,#main-title-container,#button-download-cv,#follow-title").removeClass("opacity-0")            
            $("#im-a-title,#intro-msg,#main-title-container,#button-download-cv,#follow-title").removeClass("-translate-x-10")      
            $("#my-photo").removeClass("opacity-0")      
            $("#my-photo").removeClass("translate-y-10")      
        }, 100);
        
    },500)

})

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
            $("#main-title2").addClass("opacity-0")
            $("#main-title2").addClass("translate-y-5")
            setTimeout(() => {
                $("#main-title1").removeClass("opacity-0")
                $("#main-title1").removeClass("translate-y-5")
            },500)
        }
        else {
            $("#main-title1").addClass("opacity-0")
            $("#main-title1").addClass("translate-y-5")
            setTimeout(() => {
                $("#main-title2").removeClass("opacity-0")
                $("#main-title2").removeClass("translate-y-5")
            },500)
        }
        isTextAppear = !isTextAppear
    }
    toggleTitle()
    setInterval(toggleTitle,5000)
})