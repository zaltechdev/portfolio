$(document).ready(() => {
    const BACKEND_ENDPOINT = `https://portfolio-vercel-deployment.vercel.app/sending-message`
    $("#submit-message").on("submit",(e) => {
        e.preventDefault()
        let formData = {}
        $("#submit-message").serializeArray().forEach(field => {
            formData[field.name] = field.value
        })
        
        const $submitButton = $("#submit-btn");
        const originalButtonText = $submitButton.text();
        $submitButton.prop("disabled", true).text("Mengirim...")

        $.ajax({
            url : BACKEND_ENDPOINT,
            type : "POST",
            contentType : "application/json",
            data : JSON.stringify(formData),
            success : function (res) {
                $("#feedback-success").addClass("flex").removeClass("hidden")
                $("#feedback-message-success").text(res.message)
                setTimeout(() => {
                    $("#feedback-success").addClass("hidden").removeClass("flex")
                    $("#feedback-message-success").text("")
                },5000)
            },
            error : function (err) {
                $("#feedback-failed").addClass("flex").removeClass("hidden")
                $("#feedback-message-failed").text(err.responseJSON.message)
                setTimeout(() => {
                    $("#feedback-failed").addClass("hidden").removeClass("flex")
                    $("#feedback-message-failed").text("")
                },5000)                
            },
            complete: function () {
                $submitButton.prop("disabled", false).text(originalButtonText);
            }
        })
    })
})