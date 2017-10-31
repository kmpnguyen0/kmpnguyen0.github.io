(function($) {

  Drupal.janrainCapture = Drupal.janrainCapture || {};

  // Override the resize method on the Drupal.janrainCapture object so
  // as to use a fancybox for it.
  Drupal.janrainCapture.resize = function(jargs) {
    var args = $.parseJSON(jargs);
    $("#fancybox-inner, #fancybox-wrap, #fancybox-content, #fancybox-frame")
            .css({
              width: args.w,
              height: args.h
            });
    $.fancybox.resize();
    $.fancybox.center();
  }

  // Override the passwordRecover method on the Drupal.janrainCapture object so
  // as to use a fancybox for it.
  Drupal.janrainCapture.passwordRecover = function(url) {
    $.fancybox({
      type: "iframe",
      href: url,
      padding: 0,
      scrolling: "yes",
      autoScale: true,
      width: 700,
      height: 1100,
      autoDimensions: false
    });
  }

  Drupal.behaviors.janrainCaptureUi = {
    attach: function(context, settings) {
      // Make all Capture signin and profile links appear in a fancybox.
      if ($.fn.fancybox) {
        $(".create_account", context).once("capture-ui", function() {
          var data = $(this).data();
          $(this).addClass('iframe').fancybox({
            padding: 0,
            scrolling: "yes",
            autoScale: true,
            width: 700,
            height: 1100,
            autoDimensions: false,
            onStart: function() {
              if (data.destination) {
                Drupal.janrainCapture.addDestination(data.destination);
              }
            },
            onClosed: function() {
              if (data.destination) {
                Drupal.janrainCapture.removeDestination(data.destination);
              }
            }
          });
        });
      }
    }
  };

  Drupal.behaviors.janrainCloneLogin = {
    attach: function(context, settings) {
      // If #janrainInlineAuthDiv is present, place login form inside of it.
      if ($('#janrainInlineAuthDiv').length > 0) {
        $('body', context).once('janrainLoginForm', function() {
          $('#signInHTML').appendTo('#janrainInlineAuthDiv');
          janrain.settings.capture.flowName = 'drupal_modeless';
        });
      }
    }
  };

  Drupal.behaviors.janrainCloneEditProfile = {
    attach: function (context, settings) {
      // If #janrainInlineEditProfileDiv is present, place edit profile form inside of it.
      $(window).load(function () {
        if ($('#jEditProfileHTML').length > 0) {
          $('body', context).once('janrainEditProfileForm', function() {
            janrain.settings.borderColor = '#ffffff';
            janrain.settings.fontFamily = 'Lucida Sans, Lucida Grande, sans-serif';
            janrain.settings.width = 300;
            janrain.settings.actionText = ' ';
            janrain.settings.capture.setProfileCookie = true;
            janrain.settings.capture.keepProfileCookieAfterLogout = true;
            janrain.settings.capture.modalCloseHtml = '<span class="janrain-icon-16 janrain-icon-ex2"></span>';
            janrain.settings.capture.noModalBorderInlineCss = true;
            janrain.settings.capture.returnExperienceUserData = ['displayName'];
            janrain.settings.capture.flowName = 'drupal_modeless';
            janrain.settings.capture.screenToRender = 'editProfile';
            janrain.capture.ui.start();
            janrain.capture.ui.createCaptureSession(access_token);
          });
        }
      });
    }
  };

  Drupal.behaviors.userUpdateProfile = {
    attach: function (context, settings) {
      $('#users-special-diet-selection #edit-submit', context).click(function () {
        $.cookie('dataLayerPush', JSON.stringify({'event': 'account-update', 'updated-section': 'special diets'}));
      });
      $('.pluck-persona-first-settings-info-actions-save').live('mousedown', function(){
        $.cookie('dataLayerPush', JSON.stringify({'event': 'account-update', 'updated-section': 'profile'}));
      });
      $('#capture_editProfile_saveButton').live('click', function(){
        $.cookie('dataLayerPush', JSON.stringify({'event': 'account-update', 'updated-section': 'account settings'}));
      });
    }
  };
  
  $(window).load(function () {
    try {
      janrain.events.onCaptureProfileSaveSuccess.addHandler(function() {
        window.location.href = Drupal.settings.janrainCapture.profile_sync_url;
      });
    }
    catch(e) {}
  });
})(jQuery);
