window.jsFileName = 'plugin.js';
window.jsProductionPath = 'wistia.com/labs/cleeng-pay-per-view';
/*
window.jsProductionPath = 'dev.cleeng-labs.com/cleeng/';
*/

function validateForm(id) {
	// validate the comment form when it is submitted
	var validator = $("#" + id).validate({
		rules: {
			title: {
				required: true,
				minlength: 5
			},
			description: {
				required: true,
				minlength: 5
			},
			price: {
				required: true,
				min:0.49,
				max:99.99
			},
			url: {
				required: true,
				url: true
			}
		},
		messages: {
			title: "Field required! The text should be longer than 5 characters.",
			description: "Field required! The text should be longer than 5 characters.",
			url: {
				required: "Please enter a url",
				url: "This is an invalid url. Please update."
			},
			price: {
				required: "Are you not entering the most important value?",
				min: "Price should be minimal 49 cents",
				max: "Only prices under 100 allowed. <a target='_blank' href=\"https://cleeng.com/company/contact\">Contact Cleeng</a> if you want to sell higher value items."
			}
		},
		errorPlacement: function(error, element) {
            if (error.html() =='') {
                element.css('background-color', '#ffffff');
            } else {
                element.val('');
                element.css('background-color', '#ffe4d4');
                error.insertAfter(element);
            }
		},
        success : function(label) {
            $('#'+label.attr('for')).css('background-color', '#ffffff');
        }
	});

	if (validator) {
		return validator;
	}
}
var Cleeng = function () {}

Cleeng.prototype = (function () {
    var video = {};
    var demoUrl = 'https://play.cleeng.com/movie.js?offerId=A651489841_US&width=600&height=353';

    var setCookie = function (c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }

    var getCookie = function (c_name) {
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start == -1) {
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start == -1) {
            c_value = null;
        }
        else {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start, c_end));
        }
        return c_value;
    }
    var loadExample = function() {
        $('#preview .loader').show();
        $('#preview .loader').html('<img src="loading.gif">');
        $('#preview .iframe').hide();
        jQuery.getScript(demoUrl, function () {

            $('#preview .iframe').html(window._cleeng_play_frames);
            delete window._cleeng_play_frames;
            $('#output_embed_code').val('<script type="text/javascript" src="' + demoUrl + '"></script>');
            window.setTimeout(function () {
                $('#preview .iframe').show();
                $('#preview .loader').html('');
                $('.refundNote').show();
                $(".restrictions").hide();
            }, 2000);
        });
    }
    var __construct = function () {

        Cleeng.publisherToken = getCookie('publisherAccessToken');
        if (Cleeng.publisherToken != null) {
            CleengApi.api('getPublisher', {publisherToken: Cleeng.publisherToken}, function (result) {

                if (typeof result.firstName == 'string' && result.firstName != '') {
                    Cleeng.publisherDisplayName = result.firstName+' '+result.lastName;
                    displayWelcome(Cleeng.publisherDisplayName);
                    injectCurrency(result.currency);
                    Cleeng.clearOutput();

                } else if(typeof result.firstName == 'string' && result.email != '') {
                    Cleeng.publisherDisplayName = result.email;
                    displayWelcome(Cleeng.publisherDisplayName);
                    injectCurrency(result.currency);
                    Cleeng.clearOutput();
                }
            });
        }
    }
    __construct();


    var injectCurrency = function(currency)
    {
        var currencySymbols = {'EUR' : '&#x80;', 'USD': '&#x24;', 'GBP': '&#xA3;'};
        $('.cleeng .currency').html(typeof currencySymbols[currency] == 'string'?currencySymbols[currency]:currency);
    }
    var displayWelcome = function(publisherDisplayName) {
        $('.cleeng_welcome p').html('Welcome, <b>' + publisherDisplayName + '</b> (<a href="#" id="cleeng_logout">logout</a>)');
        $(".cleeng .cleeng_login").hide();
        $(".cleeng .cleeng_setup").show();

    }
    var hideWelcome = function() {
        $('.cleeng_welcome p').html('');
        $(".cleeng .cleeng_login").show();
        $(".cleeng .cleeng_setup").hide();
    }

    var processSign = function(method) {
        CleengApi.setAppId(Cleeng.applicationId);
        CleengApi[method](Cleeng.applicationSecureKey, function (result) {
            if (typeof result.authorizationSuccessful === 'boolean' && result.authorizationSuccessful == true) {

                $(".show_example_text").show();
                $(".clear_example_text").hide();

                setCookie("publisherAccessToken", result.publisherToken, 7);
                Cleeng.publisherToken = result.publisherToken;
                CleengApi.api('getPublisher', {publisherToken: Cleeng.publisherToken}, function (result) {
                    Cleeng.publisherDisplayName = result.firstName+' '+result.lastName
                    displayWelcome(Cleeng.publisherDisplayName);
                    injectCurrency(result.currency);
                    Cleeng.clearOutput();

                });
            }
        });
    }

    var processLogout = function () {
        CleengApi.logout(function(result) {
            if (typeof result.success === 'boolean' && result.success==true) {
                hideWelcome();
                setCookie("publisherAccessToken", result.publisherToken, -1);
                Cleeng.loadExample();
                Cleeng.publisherToken = null;
            }
        });
    }

    var processOffer = function (offerData, callback, method, update) {
        var object = {
            "publisherToken": Cleeng.publisherToken
        }

        if (typeof update == 'boolean' && update) {
            object.offerId = Cleeng.offerId;
        }

        var contentExternalData = {
            platform: 'wistia',
            dimWidth: offerData.videoOptions.videoWidth,
            dimHeight: offerData.videoOptions.videoHeight,
            hasPreview: false,
            previewVideoId: false,
            backgroundImage: typeof Cleeng.video.thumbnail_url == 'string' ? Cleeng.video.thumbnail_url : ''
        };
        delete offerData.videoOptions.videoWidth;
        delete offerData.videoOptions.videoHeight;

        contentExternalData = jQuery.extend(contentExternalData, offerData.videoOptions);
        $('.refundNote').hide();

        object.offerData = {
            "price": offerData.price,
            "title": offerData.title,
            "description": offerData.description,
            "url": offerData.url,
            "period": offerData.rental_time,
            "contentExternalId": offerData.hashedId,
            "contentExternalData": JSON.stringify(contentExternalData)
        }
        CleengApi.api(method, object, function (result) {

            if (typeof result.error == 'object') {
                if (result.error.code == 1 || result.error.code == 3) {
                    callback({error: {
                        column: 'publisherToken',
                        message: result.error.message
                    }});
                } else {
                    var result = result.error.message.split(':');
                    var column = result[0];
                    var message = result[1];
                    callback({error: {
                        column: column,
                        message: message
                    }});
                }
                return false;
            }

            Cleeng.offerId = result.id;

            var result = 'https://' + Cleeng.playEnv + '/movie.js?offerId='
                + result.id + '&width='
                + contentExternalData.dimWidth + '&height='
                + parseInt(contentExternalData.dimHeight+63) + '&writeIframe=0&clearCache=1';
            callback(result);
        });
    }

    return {
        offerId: null,
        playEnv: 'play.cleeng.com',
        publisherToken: Cleeng.publisherToken,
        publisherDisplayName: null,
        applicationId: null,
        applicationSecureKey: null,
        createVideoDetails: function (source_embed_code) {
            var source_embed_code = Wistia.EmbedCode.parse(source_embed_code);
            $.ajax({
                url: "http://fast.wistia.net/oembed?url=http://home.wistia.com/medias/" + source_embed_code.hashedId()
            }).done(function (video) {
                Cleeng.video = video;
                $('.cleeng #title').val(Cleeng.video.title);
            });

        },
        createOffer: function (offerData, callback) {
            var method = "createSingleOffer";
            if (offerData.rental_time != '') {
                method = "createRentalOffer";
            }
            processOffer(offerData, callback, method);

        },
        updateOffer: function (offerData, callback) {
            var method = "updateSingleOffer";
            if (offerData.rental_time != '') {
                method = "updateRentalOffer";
            }
            processOffer(offerData, callback, method, true);
            $('.cleeng .alert').html("");

        },
        login: function () {
            processSign("publisherLogin");
        },
        register: function () {
            processSign("publisherRegistration");
        },
        logout: function() {
            processLogout();
        },
        clearInputs: function() {
            $('.cleeng .cleeng_setup input').val('');
            $(".cleeng .button_row.update").hide();
            $(".cleeng .button_row.create").show();
            return true;

        },
        clearOutput: function() {

            $(".refundNote").hide();
            $(".restrictions").hide();
            $('#output_embed_code').val('');
            $('#preview .iframe').html('');
            $('#preview .iframe').hide();
            $('#preview .loader').html('Your video here');
            return true;
        },
        loadExample : function() {
            loadExample();
        },
        updateInfo : function() {
            if ($('.button_row .update').css('display')=='block') {
                $('.cleeng .alert').html("You've made some changes. Click the Update button to preview them.");
            }
        }

    }
})();


var Cleeng = new Cleeng();
/*

Cleeng.playEnv = 'dev.play.cleeng.com';
Cleeng.applicationId = 'Eg3qECmLwW84b8c6BvmHZwCg3_NIcRnqXoh_DinuEYF2ioIA';
Cleeng.applicationSecureKey = 'AgncXysDJg0XlIl0dbd270T8NsVOfLTBQA4t2EFkzg0j5PpK';
*/


Cleeng.playEnv = 'play.cleeng.com';
Cleeng.applicationId = 'OEFpegyYqfsbr4OyI3ZtgX6FjZw0pWqVcjqj2ApPjtpV5U79';
Cleeng.applicationSecureKey = 'QiHH4wW9NRZkusCDB_r2K3ut87gYgmGPLvP12zoFZ8ltscm5';


function updateOutput(update) {
    var sourceEmbedCode = Wistia.EmbedCode.parse($("#source_embed_code").val());

    if (sourceEmbedCode && sourceEmbedCode.isValid()) {
        $('#preview .loader').html('<div  class="protection_in_progress cleeng"><img  src="loading.gif"><br>protection in progress</div>');
        $('#preview .iframe').hide();
        var method = 'createOffer';
        if (typeof update == 'boolean' && update) {
            method = 'updateOffer';
        }
        $('.cleeng .error').html('');
        Cleeng[method]({
            title: $('.cleeng #title').val(),
            price: $('.cleeng #price').val(),
            description: $('.cleeng #description').val(),
            rental_time: $('.cleeng #period').val(),
            url: $('.cleeng #url').val(),
            hashedId: sourceEmbedCode.hashedId(),
            videoOptions: sourceEmbedCode._options
        }, function (result) {
            if (typeof result.error == 'object') {
                $('.cleeng .error.' + result.error.column).html(result.error.message).show();
                $('#preview .loader').html('Your video here');

            } else {
                var scriptUrl_ = result.replace("&writeIframe=0&clearCache=1", "");
                window._cleeng_play_frames = [];
                jQuery.getScript(result, function () {

                    $("#output_embed_code").val('<script type="text/javascript" src="' + scriptUrl_ + '"></script>');

                    $('#preview .iframe').html(window._cleeng_play_frames);

                    window.setTimeout(function () {
                        $('#preview .iframe').show();
                        $('#preview .loader').html('');
                        $(".cleeng .button_row.update").show();
                        $(".cleeng .button_row.create").hide();
                        $(".restrictions").show();
                        $(".cleeng .cleeng_login").hide();

                        if ($('.cleeng #period').val() == '') {
                            $('#period').hide();
                            $('#period').prev().hide();
                            $('#period').next().hide();
                        }
                    }, 2000);

                    window._cleeng_play_frames = [];
                });
            }
        })

    } else {
        // Show an error if invalid. We can be more specific
        // if we expect a certain problem.
        $("#output_embed_code").val("Please enter a valid Wistia embed code.");
        $("#preview").html('<div id="placeholder_preview">Your video here</div>');
    }
}


// Updating is kind of a heavy operation; we don't want to 
// do it on every single keystroke.
var updateOutputTimeout;
function debounceUpdateOutput(update) {
    clearTimeout(updateOutputTimeout);
    updateOutputTimeout = setTimeout(updateOutput(update), 500);
}

// Assign all DOM bindings on doc-ready in here. We can also
// run whatever initialization code we might need.
window.setupLabInterface = function ($) {
    $(function () {
        // Update the output whenever the user clicks the update button.
        $("#configure").on("click", "#update_video", function (e) {
            e.preventDefault();

            if ($('#cleengForm').valid()) {
                debounceUpdateOutput(true);
            }
        });

        $('#configure').on('click', '#cleeng_login', function (e) {
            e.preventDefault();
            Cleeng.login();
        });
        $('#configure').on('click', '#cleeng_register', function (e) {
            e.preventDefault();
            Cleeng.register();
        });
        $('#configure').on('click', '#cleeng_logout', function (e) {
            e.preventDefault();
            Cleeng.logout();
        });

        $("#configure").on("click", "#create_video", function (e) {
            e.preventDefault();

            if ($('#cleengForm').valid()) {
                debounceUpdateOutput();
            }

        });

        $("#configure").on("keydown", "input,select", function (e) {
            Cleeng.updateInfo();
        });



        $("#configure").on("click", ".cleeng .create_new_offer", function (e) {
            e.preventDefault();
            Cleeng.clearInputs();
            Cleeng.clearOutput();
        });


        $("#configure").on("keydown", "#source_embed_code", function (e) {
            Cleeng.createVideoDetails($(this).val());
        });

        if (!Wistia.localStorage("cleeng.cleared")) {
            showExample();
            $(".show_example_text").hide();
            $(".clear_example_text").show();
            Cleeng.loadExample();
        } else {
            $(".show_example_text").show();
            $(".clear_example_text").hide();
            Cleeng.clearOutput();
        }

        $("#clear_example").click(function (event) {
            event.preventDefault();
            resetInterface();
            Cleeng.clearOutput();
            $(".show_example_text").show();
            $(".clear_example_text").hide();
            Wistia.localStorage("cleeng.cleared", true);
        });

        $("#show_example").click(function (event) {
            event.preventDefault();
            showExample();
            Cleeng.loadExample();
            $(".show_example_text").hide();
            $(".clear_example_text").show();
            Wistia.localStorage("cleeng.cleared", false);
        });
        validateForm('cleengForm');
        $('#cleeng_tooltip').tooltip({placement:'right'});

    });
};


window.resetInterface = function () {
    $("#source_embed_code").val("").keyup().change();
};

window.showExample = function () {
    resetInterface();
    $("#source_embed_code").val("<iframe src=\"http://fast.wistia.net/embed/iframe/z2jyabeqvi?playerColor=81b7db&version=v1&videoHeight=290&videoWidth=600&volumeControl=true\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"600\" height=\"290\"></iframe>").keyup().change();
    Cleeng.createVideoDetails($("#source_embed_code").val());

};

setupLabInterface(jQuery);
