/**
 * @file
 * Javascript file for Healthy Eating newsletter signup.
 */
(function( $ ){
  $.fn.ajaxNewsletter = function(options) {
    var ajaxNewsletterForm = {
      options: $.extend({
        'formSelector': '.newsletter-ajax-form',
        'inputSelector': '.newsletter-ajax-form input.email',
        'submitSelector': '.newsletter-ajax-form input.form-submit',
        'submitElement': '<input type="submit" id="edit-submit" name="op" value="Subscribe" class="form-submit">',
      }, options),

      /**
       * Add event listeners.
       */
      addListeners: function() {
        $('body').delegate(ajaxNewsletterForm.options.formSelector, 'submit', function(){
          ajaxNewsletterForm.onFormSubmit();
          return false;
        });
        $('body').delegate(ajaxNewsletterForm.options.inputSelector, 'focus', function(){
          if($(this).hasClass('error')) {
            $(this).removeClass('error');
            $(this).val('');
          }
        });
      },

      /**
       * Before AJAX call replace submit button with loading gif.
       */
      beforeSendCallback: function(){
        $('.status-message').remove();
        var imagePath = '/sites/all/themes/wholefoods/images/ajax-loader2.gif';
        var imageTag = '<img src="'+imagePath+'" alt="' + Drupal.t('Loading....') + '" id="loadinggif">';
        $(ajaxNewsletterForm.options.submitSelector).replaceWith(imageTag);
      },

      /**
       * User feedback error message.
       *
       * @param string message
       *   Message to display.
       */
      errorMessage: function(message) {
        $(ajaxNewsletterForm.options.inputSelector).addClass('error');
        var display_message = '<p class="error  status-message">' + message + '</p>';
        $('#loadinggif').replaceWith(display_message);
        $('p.error').after(ajaxNewsletterForm.options.submitElement);
      },

      /**
       * User feedback error message.
       */
      getInputData: function() {
        var data = {};
        $(this.options.formSelector + ' input').each(function(index){
          var key = $(this).attr('name');
          var value = $(this).val();
          data[key] = value;
        });
        return data;
      },

      /**
       * Set everything up.
       */
      init: function() {
        ajaxNewsletterForm.addListeners();
        ajaxNewsletterForm.setDefaults();
      },

      /**
       * Form submit callback function.
       */
      onFormSubmit: function() {
        var formdata = ajaxNewsletterForm.getInputData();
        var url = '/ajax/newsletters/subscribe/healthy_eating';
        var settings = {
          beforeSend: ajaxNewsletterForm.beforeSendCallback(),
          data: formdata,
          success: function(data, textStatus, jqXHR) {
            var response = $.parseJSON(data);
            ajaxNewsletterForm.successCallback(response);
          },
          type: 'POST'
        };
        $.ajax(url, settings);
      },

      /**
       * Set email input from Drupal.settings.WholeFoods.user.email
       */
      setDefaults: function() {
        if(Drupal.settings.WholeFoods.user.email !== null) {
          var email = Drupal.settings.WholeFoods.user.email;
          $(ajaxNewsletterForm.options.inputSelector).val(email);
        }
      },

      /**
       * AJAX success callback function
       *
       * @param object response
       *   JSON encoded response object from drupal_http_request.
       */
      successCallback: function(response) {
        if(response.code === '200') {
          ajaxNewsletterForm.successMessage();
          ajaxNewsletterForm.pushEvent('success');
        }
        else {
          ajaxNewsletterForm.errorMessage(response.status_message);
          ajaxNewsletterForm.pushEvent(error);
        }
      },

      /**
       * Set user feedback success message.
       */
      successMessage: function() {
        $(ajaxNewsletterForm.options.inputSelector).addClass('success');
        $(ajaxNewsletterForm.options.formSelector).addClass('success');
        var success_message = Drupal.t("Thanks! You're subscribed!");
        var display_message = '<p class="success status-message">' + success_message + '</p>';
        $('#loadinggif').replaceWith(display_message);
      },

      /**
       * Push event into window.dataLayer for Google Analytics
       */
      pushEvent: function(status) {
        var form = ajaxNewsletterForm.options.formSelector;
        var subPromo = $(form).find('input[name="SUB_PROMO"]').val();
        var eventObject = {
          event: 'newsletter-subscribe',
          formLocation: subPromo,
          subscribeStatus: status
        };

        if (window.dataLayer) {
          window.dataLayer.push(eventObject);
        }
      }
    };

    ajaxNewsletterForm.init();
  };
})( jQuery );

//Attach to Drupal behaviors
(function( $ ) {
  Drupal.behaviors.ajaxNewsletter = {
    attach: function(context, settings) {
      //Run on window.load so that settings are ready in Drupal.settings object
      $(window).load(function(){
        $('body', context).once('ajaxNewsletter', function(){
          $().ajaxNewsletter();
        });
      });
    }
  }
})( jQuery );
;/**/
