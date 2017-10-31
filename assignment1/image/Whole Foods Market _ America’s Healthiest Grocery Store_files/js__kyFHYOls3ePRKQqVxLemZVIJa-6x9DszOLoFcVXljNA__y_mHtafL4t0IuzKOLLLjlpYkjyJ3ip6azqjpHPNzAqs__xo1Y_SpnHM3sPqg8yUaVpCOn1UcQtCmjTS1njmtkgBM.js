(function ($) {
  Drupal.behaviors.wfm8HeaderSignInLink = {
    attach: function(context, settings) {
      var SignInLink = $('.wfm_embeddable_header a.menu__link[href$="signin"]', context);
      var destination = window.location.pathname + window.location.search;
      // Remove Drupal Base Path prefix.
      if (destination.indexOf(Drupal.settings.basePath) === 0) {
        destination = destination.replace(Drupal.settings.basePath, '');
      }
      SignInLink.attr('href', Drupal.settings.wfm8_header.signinURL + '?destination=' + encodeURIComponent(destination));
    }
  };
})(jQuery);

;/**/
/**
 * @file
 * Behavior for store select forms.
 */

//Self-invoking function
(function($){
  "use strict";
  $.fn.WFMstoreSelect = function() {
    var storeselect = {

      settings: {
        storeoptions: {},
      },

      /**
       * Add listeners to dom elements
       */
      addListeners: function() {
        $('.state-select').change(function () {
          storeselect.setFormId(this);
          storeselect.enableStoreSelect(this);
          storeselect.setStoreOptionsByState(this);
          storeselect.disableSubmit(this);
        });
        $('.store-select').change(function() {
          storeselect.setFormId(this);
          storeselect.enableSubmit(this);
        });
        $('.store-select-form').on('submit', storeselect.handleSubmit);
      },

      /**
       * Ajax callback to set default user store.
       * @param storeObject
       */
      ajaxCallBack: function(storeObject) {
        var store = Drupal.WholeFoods.removeStoreNidKey(storeObject);

        if (store && typeof(store) == 'object') {
          storeselect.setUserDefaults(store);
        }
      },

      /**
       * Sometimes multiple store select forms can come into the page with the
       * same id. This function will check if there are multiple forms with
       * #store-select-form. In that case we iterate over the forms and add a
       * number to the form. eg #store-select-form-0, #store-select-form-1
       */
      changeForMultipleIds: function() {
        var j = 0;
        if ($('form#store-select-form').length > 1) {
          $('form#store-select-form').each(function(i){
            this.setAttribute("id", "store-select-form-" + j);
            var storeSelect = $("form#store-select-form-" + j).find('.state-select');
            storeselect.disableStoreSelect(storeSelect);
            storeselect.setStoreOptionsByState();
            storeselect.disableSubmit(storeSelect);
            storeselect.addListeners();
            j++;
          });
        }
      },

      /**
       * Disable store-select form store drop-down.
       * @param object state_select
       *   DOM element of state select.
       */
      disableStoreSelect: function(state_select) {
        var selected_state = $(state_select).val(),
            form_id = '#' + $(state_select).parents('form').attr('id');
        if (!selected_state || selected_state == '0') { //Zero as a string. Intentional.
          $(form_id + ' .store-select').addClass('disabled').prop('disabled', true);
        }
      },

      /**
       * Disable store-select form submit.
       * @param object state_select
       *   DOM element of state select.
       */
      disableSubmit: function(state_select) {
        var form_id = '#' + $(state_select).parents('form').attr('id'),
            selected_store = $(form_id + ' .store-select').val();
        if (!selected_store) {
          $(form_id + ' .store-select-submit').addClass('disabled').prop('disabled', true);
        }
      },

      /**
       * Enable store-select form store drop-down.
       * @param object state_select
       *   DOM element of state select.
       */
      enableStoreSelect: function(state_select){
        var form_id = '#' + storeselect.form_id;
        if ($(state_select).val() && $(state_select).val() !== '0') { // Zero as a string. Intentional.
          $(form_id + ' .store-select').removeClass('disabled').prop('disabled', false);
        }
      },

      /**
       * Enable store-select form submit.
       * @param object store_select
       *   DOM element of store select.
       */
      enableSubmit: function(store_select) {
        var form_id = '#' + storeselect.form_id;
        $(form_id + ' .store-select-submit').prop('disabled', false).removeClass('disabled');
      },
  
      /**
       * Update the cookies related to the store. This function
       * intercepts the store select form submission the first time
       * to set cookies, then calls the submit event again to allow other
       * events and behaviors to continue as normal.
       *
       * To ensure that this behavior runs before any other, all form
       * submissions that set a store should check for 'cookiesUpdated'
       * on their form.
       *
       * @param e
       */
      handleSubmit: function (e) {
        var form_id,
            form,
            store_nid,
            expire_time;
        
        form_id = storeselect.form_id;
        form = $('#' + form_id);
        store_nid = $('#' + form_id + ' .store-select').val();
        
        if (!form.data('cookiesUpdated') && store_nid) {
          e.preventDefault();
          
          expire_time = new Date().getTime() + 31557600; // One year from now
  
          Drupal.WholeFoods.getStoreInfo(store_nid, function (store) {
            store = store[store_nid];
            
            $.cookie('local_store', store_nid, {
              expires: expire_time,
              path: '/',
              secure: true
            });
  
            $.cookie('local_store_id', store.tlc, {
              expires: expire_time,
              path: '/',
              secure: true
            });
  
            $.cookie('local_store_name', store.storename, {
              expires: expire_time,
              path: '/',
              secure: true
            });
  
            $.cookie('local_store_url', '/stores/' + store.path, {
              expires: expire_time,
              path: '/',
              secure: true
            });
  
            form.data('cookiesUpdated', true);
            form.submit();
          });
        }
      },

      /**
       * Get id's for each store select on the page
       * @returns {Array}
       */
      findStoreSelectForms: function() {
        var ids = [];
        $('.store-select-form').each(function(){
          var id = $(this).attr('id');
          ids.push(id);
        });
        return ids;
      },

      /**
       * Build store <option> element.
       * @param object values
       *   Attributes for the option element in key/value pairs.
       *   If not defined, it will default to the "please select a store" prompt.
       * @return object
       *   <option> DOM element
       */
      getOption: function(values) {
        var opt = document.createElement('OPTION'),
            option_values = {},
            defaults = {
              label: Drupal.t('Please Select a Store'),
              text: Drupal.t('Please Select a Store'),
              value: ''
            };
            
        if (typeof values == 'undefined') {
          values = {};
        }
        
        // update the new element's properties with the given values
        option_values = $.extend(option_values, defaults, values);
        for (var attribute in option_values) {
          // Check to make sure property is not coming from object prototype.
          if (option_values.hasOwnProperty(attribute)) {
            opt[attribute] = option_values[attribute];
          }
        }
        
        return opt;
      },

      /**
       * Get store option values from the store select drop-down and save them
       * in storeselect.settings.storeoptions variable.
       */
      getStoreOptions: function() {
        // find all store select forms on the page
        var forms = storeselect.findStoreSelectForms();
        
        // for each form, record the initial state of the list of available stores
        // in order to ensure that no form interfere's with the other's data
        forms.map(function(form_id) {
          storeselect.settings.storeoptions[form_id] = $.extend({}, Drupal.settings.WholeFoods.stores);
        });
      },

      /**
       * Initialization function.
       */
      init: function() {
        storeselect.addListeners();
        storeselect.changeForMultipleIds();
        storeselect.getStoreOptions();
        $('.state-select').each(function(){
          storeselect.disableStoreSelect(this);
          storeselect.setStoreOptionsByState(this);
          storeselect.disableSubmit(this);
        });
        storeselect.prepareUserDefaults();
      },

      /**
       * Determine if user has a store selected
       */
      prepareUserDefaults: function() {
        var settings = storeselect.getSettingsForm();
        // only load the server's local_store cookie if a local one is not available
        var storenid = $.cookie('local_store') || Drupal.WholeFoods.getCookie('local_store');
        
        if (settings.store) {
           storenid = settings.store;
        }

        if (storenid) {
          Drupal.WholeFoods.getStoreInfo(storenid, storeselect.ajaxCallBack);
        }
      },

      /**
      * Get settings from url
      */
      getSettingsForm: function() {
        var params = {};
        if (location.search) {
           var parts = location.search.substring(1).split('&');
             for (var i = 0; i < parts.length; i++) {
                 var nv = parts[i].split('=');
                 if (!nv[0]) continue;
                 params[nv[0]] = nv[1] || true;
                }
        }
        return params;
      },

      /**
       * Set form_id variable so we know which form we're dealing with
       * setFormId(this);
       */
      setFormId: function(element) {
        storeselect.form_id = $(element).parents('form').attr('id');
      },

      /**
       * Filter store select options by selected state.
       * @param object state_select
       *   State select DOM object
       */
      setStoreOptionsByState: function(state_select) {
        var optGroup,
          key,
          i,
          j;
        var form_id = $(state_select).parents('form').attr('id'), // find the form this state select is a part of
          stateabbr = $(state_select).val(), // get the state that we'll be showing the stores from
          defaultopt = storeselect.getOption(), // construct the default "please select one" option for this element
          store_select_element = $('#' + form_id + ' .store-select'), // find the store select element related to the given state select
          options = storeselect.settings.storeoptions[form_id] || {}, // the data from ajax/stores in Drupal.settings.WholeFoods.stores, set in getStoreOptions
          optGroups = {},
          cities = [],
          stores = [];

        // reset store select to empty state
        store_select_element.empty();
        store_select_element.append(defaultopt);

        // Filter store data to look at stores from the selected state.
        // Reorganize ajax store data to be grouped by city and then store.
        $.each(options, function(index, value) {
          var optGroupElement,
            optionValues,
            name,
            city;
          var location = value.location;
          // only organize for the selected state
          if (location && location.stateabbr == stateabbr) {
            city = location.city;
            name = value.storename + ' - ' + location.street;
            // We want to display the list of stores grouped by city.
            // Add an option group element for every city that we have not already accounted for.
            if (!optGroups[city]) {
              optGroupElement = document.createElement('optgroup');
              optGroupElement.label = city;
              // the option group
              optGroups[city] = {
                element: optGroupElement, // the element
                options: {} // a hash map of all the stores belonging to the city
              };
            }
            // retrieve the city option group if we haven't already
            optGroup = optGroups[city];
            
            // prep the properties to set on store option element
            // label is the store's name + address, value is storenid
            optionValues = {
              label: name,
              text: name,
              value: index,
              // is this our user's selected store?
              selected: Drupal.WholeFoods.getCookie('local_store') == index
            };
            // create our option element, and add it later, once our data is sorted
            optGroup.options[name] = storeselect.getOption(optionValues);
          }
        });
        
        // we'll be sorting cities and stores to make them easier to scan for our users
        
        // sort cities alphabetically
        // convert hash map of cities into sortable array
        for (key in optGroups) {
          cities.push(key);
        }
  
        cities.sort();
  
        // sort stores alphabetically
        for (i = 0; i < cities.length; i++) {
          // add city grouping to page in alphabetical order
          optGroup = optGroups[cities[i]];
          store_select_element.append(optGroup.element);
    
          // convert hash map of stores into sortable array
          for (key in optGroup.options) {
            stores.push(key);
          }
          stores.sort();
          
          // add stores in alphabetical order
          for (j = 0; j < stores.length; j++) {
            $(optGroup.element).append(optGroup.options[stores[j]])
          }
        }
      }, //setStateOptions

      /**
       * Set default state/store values from user's selected store.
       * @param object store
       *   Store info object from Drupal.setting.WholeFoods.stores
       */
      setUserDefaults: function(store) {
        var validStore = store && typeof(store) == 'object';
        var hasLocation,
            hasAbbreviation,
            hasNid;

        if (!validStore) {
          return;
        }

        // Remove store nid key from store object.
        // store = { 6606 { name: "" ... } } becomes store = { name: "" ... }.
        if (Object.keys(store).length === 1) {
          store = Drupal.WholeFoods.removeStoreNidKey(store);
        }

        hasLocation = store.hasOwnProperty('location');

        // Don't attempt to access sub-property of location if it doesn't exist.
        if (!hasLocation) {
          return;
        }

        hasAbbreviation = store.location.hasOwnProperty('stateabbr');
        hasNid = store.hasOwnProperty('nid');

        if (!hasLocation || !hasAbbreviation || !hasNid) {
          return;
        }

        $('.state-select option[value="' + store.location.stateabbr + '"]').prop('selected', true);

        //This trigger is necessary for FF to notice the change.
        $('.state-select').trigger('change');

        $('.store-select').removeClass('disabled').prop('disabled', false);
        $('.store-select option[value="' + store.nid + '"]').prop('selected', true);
        $('.store-select').each(function () {
          storeselect.enableSubmit(this);
        });
      }

    }; //storeselect
    storeselect.init();

    Drupal.WholeFoods.setStoreSelectStore = storeselect.setUserDefaults;
  };

})(jQuery);

/**
 * Attach to Drupal behaviors.
 */
(function wfm_storeselect ($) {
   Drupal.behaviors.wfmstoreselect = {
    attach: function (context) {
      var init = function () {
        if (Drupal.settings.WholeFoods.stores) {
          jQuery('.store-select-form', context).WFMstoreSelect();
        }
      };
      
      // make sure we have store data available before initializing
      jQuery(document).one('store_data_ready', init);
      jQuery('body', context).once('ss-attach', init);
    }
  };
})(jQuery);
;/**/

/**
 *  @file
 *  Attach Media WYSIWYG behaviors.
 */

(function ($) {

Drupal.media = Drupal.media || {};

// Define the behavior.
if (typeof Drupal.wysiwyg != 'undefined') {
Drupal.wysiwyg.plugins.media = {

  /**
   * Initializes the tag map.
   */
  initializeTagMap: function () {
    if (typeof Drupal.settings.tagmap == 'undefined') {
      Drupal.settings.tagmap = { };
    }
  },
  /**
   * Execute the button.
   * @TODO: Debug calls from this are never called. What's its function?
   */
  invoke: function (data, settings, instanceId) {
    if (data.format == 'html') {
      Drupal.media.popups.mediaBrowser(function (mediaFiles) {
        Drupal.wysiwyg.plugins.media.mediaBrowserOnSelect(mediaFiles, instanceId);
      }, settings['global']);
    }
  },

  /**
   * Respond to the mediaBrowser's onSelect event.
   * @TODO: Debug calls from this are never called. What's its function?
   */
  mediaBrowserOnSelect: function (mediaFiles, instanceId) {
    var mediaFile = mediaFiles[0];
    var options = {};
    Drupal.media.popups.mediaStyleSelector(mediaFile, function (formattedMedia) {
      Drupal.wysiwyg.plugins.media.insertMediaFile(mediaFile, formattedMedia.type, formattedMedia.html, formattedMedia.options, Drupal.wysiwyg.instances[instanceId]);
    }, options);

    return;
  },

  insertMediaFile: function (mediaFile, viewMode, formattedMedia, options, wysiwygInstance) {
    if(!mediaFile.filemime.match(/image/)){
      instance = wysiwygInstance.field;
      var currentEditor = CKEDITOR['instances'][instance];
      var selectedObj= currentEditor.getSelection();
      var text = '';

			if (typeof selectedObj != 'undefined' && selectedObj != null) { 
        if (CKEDITOR.env.ie) {
          selectedObj.unlock(true);
          text = selectedObj.getNative().createRange().text;
        } else {
          text = selectedObj.getNative();
        }
				text = text.toString();
			}


      if(!text.length > 0){
        text = mediaFile.filename;
      }

      var url = mediaFile.url;
      var exploded = url.split('/');
      exploded.shift();
      exploded.shift();
      exploded.shift();
      var url = '/' + exploded.join('/');

      url = url.replace('http://', '');
      url = url.replace('https://', '');
      url = url.replace(document.domain, '');
      var toInsert = '<a href="' + url + '">' + text + '</a>';
    }else{
      this.initializeTagMap();
      // @TODO: the folks @ ckeditor have told us that there is no way
      // to reliably add wrapper divs via normal HTML.
      // There is some method of adding a "fake element"
      // But until then, we're just going to embed to img.
      // This is pretty hacked for now.
      //
      var imgElement = $(this.stripDivs(formattedMedia));
      this.addImageAttributes(imgElement, mediaFile.fid, viewMode, options);

      var toInsert = this.outerHTML(imgElement);
      // Create an inline tag
      var inlineTag = Drupal.wysiwyg.plugins.media.createTag(imgElement);
      // Add it to the tag map in case the user switches input formats
      Drupal.settings.tagmap[inlineTag] = toInsert;
    }
    wysiwygInstance.insert(toInsert);
  },

  /**
   * Gets the HTML content of an element
   *
   * @param jQuery element
   */
  outerHTML: function (element) {
    return $('<div>').append( element.eq(0).clone() ).html();
  },

  addImageAttributes: function (imgElement, fid, view_mode, additional) {
    //    imgElement.attr('fid', fid);
    //    imgElement.attr('view_mode', view_mode);
    // Class so we can find this image later.
    imgElement.addClass('media-image');
    this.forceAttributesIntoClass(imgElement, fid, view_mode, additional);
    if (additional) {
      for (k in additional) {
        if (additional.hasOwnProperty(k)) {
          if (k === 'attr') {
            imgElement.attr(k, additional[k]);
          }
        }
      }
    }
  },

  /**
   * Due to problems handling wrapping divs in ckeditor, this is needed.
   *
   * Going forward, if we don't care about supporting other editors
   * we can use the fakeobjects plugin to ckeditor to provide cleaner
   * transparency between what Drupal will output <div class="field..."><img></div>
   * instead of just <img>, for now though, we're going to remove all the stuff surrounding the images.
   *
   * @param String formattedMedia
   *  Element containing the image
   *
   * @return HTML of <img> tag inside formattedMedia
   */
  stripDivs: function (formattedMedia) {
    // Check to see if the image tag has divs to strip
    var stripped = null;
    if ($(formattedMedia).is('img')) {
      stripped = this.outerHTML($(formattedMedia));
    } else {
      stripped = this.outerHTML($('img', $(formattedMedia)));
    }
    // This will fail if we pass the img tag without anything wrapping it, like we do when re-enabling WYSIWYG
    return stripped;
  },

  /**
   * Attach function, called when a rich text editor loads.
   * This finds all [[tags]] and replaces them with the html
   * that needs to show in the editor.
   *
   */
  attach: function (content, settings, instanceId) {
    var matches = content.match(/\[\[.*?\]\]/g);
    this.initializeTagMap();
    var tagmap = Drupal.settings.tagmap;
    if (matches) {
      var inlineTag = "";
      for (i = 0; i < matches.length; i++) {
        inlineTag = matches[i];
        if (tagmap[inlineTag]) {
          // This probably needs some work...
          // We need to somehow get the fid propogated here.
          // We really want to
          var tagContent = tagmap[inlineTag];
          var mediaMarkup = this.stripDivs(tagContent); // THis is <div>..<img>

          var _tag = inlineTag;
          _tag = _tag.replace('[[','');
          _tag = _tag.replace(']]','');
          try {
            mediaObj = JSON.parse(_tag);
          }
          catch(err) {
            mediaObj = null;
          }
          if(mediaObj) {
            var imgElement = $(mediaMarkup);
            this.addImageAttributes(imgElement, mediaObj.fid, mediaObj.view_mode);
            var toInsert = this.outerHTML(imgElement);
            content = content.replace(inlineTag, toInsert);
          }
        }
        else {
          debug.debug("Could not find content for " + inlineTag);
        }
      }
    }
    return content;
  },

  /**
   * Detach function, called when a rich text editor detaches
   */
  detach: function (content, settings, instanceId) {
    // Replace all Media placeholder images with the appropriate inline json
    // string. Using a regular expression instead of jQuery manipulation to
    // prevent <script> tags from being displaced.
    // @see http://drupal.org/node/1280758.
    if (matches = content.match(/<img[^>]+class=([\'"])media-image[^>]*>/gi)) {
      for (var i = 0; i < matches.length; i++) {
        var imageTag = matches[i];
        var inlineTag = Drupal.wysiwyg.plugins.media.createTag($(imageTag));
        Drupal.settings.tagmap[inlineTag] = imageTag;
        content = content.replace(imageTag, inlineTag);
      }
    }
    return content;
  },

  /**
   * @param jQuery imgNode
   *  Image node to create tag from
   */
  createTag: function (imgNode) {
    // Currently this is the <img> itself
    // Collect all attribs to be stashed into tagContent
    var mediaAttributes = {};
    var imgElement = imgNode[0];
    var sorter = [];

    // @todo: this does not work in IE, width and height are always 0.
    for (i=0; i< imgElement.attributes.length; i++) {
      var attr = imgElement.attributes[i];
      if (attr.specified == true) {
        if (attr.name !== 'class') {
          sorter.push(attr);
        }
        else {
          // Exctract expando properties from the class field.
          var attributes = this.getAttributesFromClass(attr.value);
          for (var name in attributes) {
            if (attributes.hasOwnProperty(name)) {
              var value = attributes[name];
              if (value.type && value.type === 'attr') {
                sorter.push(value);
              }
            }
          }
        }
      }
    }

    sorter.sort(this.sortAttributes);

    for (var prop in sorter) {
      mediaAttributes[sorter[prop].name] = sorter[prop].value;
    }

    // The following 5 ifs are dedicated to IE7
    // If the style is null, it is because IE7 can't read values from itself
    if (jQuery.browser.msie && jQuery.browser.version == '7.0') {
      if (mediaAttributes.style === "null") {
        var imgHeight = imgNode.css('height');
        var imgWidth = imgNode.css('width');
        mediaAttributes.style = {
          height: imgHeight,
          width: imgWidth
        }
        if (!mediaAttributes['width']) {
          mediaAttributes['width'] = imgWidth;
        }
        if (!mediaAttributes['height']) {
          mediaAttributes['height'] = imgHeight;
        }
      }
      // If the attribute width is zero, get the CSS width
      if (Number(mediaAttributes['width']) === 0) {
        mediaAttributes['width'] = imgNode.css('width');
      }
      // IE7 does support 'auto' as a value of the width attribute. It will not
      // display the image if this value is allowed to pass through
      if (mediaAttributes['width'] === 'auto') {
        delete mediaAttributes['width'];
      }
      // If the attribute height is zero, get the CSS height
      if (Number(mediaAttributes['height']) === 0) {
        mediaAttributes['height'] = imgNode.css('height');
      }
      // IE7 does support 'auto' as a value of the height attribute. It will not
      // display the image if this value is allowed to pass through
      if (mediaAttributes['height'] === 'auto') {
        delete mediaAttributes['height'];
      }
    }

   // Convert style-based floating of images to classes. Note we leave the
   // the attribute so that the WYSIWYG editor will remember the setting.
   // First, remove any previous left/right classes, note that class will
   // contain at least 'media-image'
   mediaAttributes['class'] = mediaAttributes['class'].replace(/\s*media-image-(left|right)\s*/g, ' ');

   // Add appropriate left/right class to the <img> tag.
   if (mediaAttributes['style']) {
     if (-1 != mediaAttributes['style'].indexOf('float: right;')) {
       mediaAttributes['class'] += ' media-image-right';
    }
    if (-1 != mediaAttributes['style'].indexOf('float: left;')) {
      mediaAttributes['class'] += ' media-image-left';
     }
   }

    // Remove elements from attribs using the blacklist
    for (var blackList in Drupal.settings.media.blacklist) {
      delete mediaAttributes[Drupal.settings.media.blacklist[blackList]];
    }
    tagContent = {
      "type": 'media',
      // @todo: This will be selected from the format form
      "view_mode": attributes['view_mode'].value,
      "fid" : attributes['fid'].value,
      "attributes": mediaAttributes
    };
    return '[[' + JSON.stringify(tagContent) + ']]';
  },

  /**
   * Forces custom attributes into the class field of the specified image.
   *
   * Due to a bug in some versions of Firefox
   * (http://forums.mozillazine.org/viewtopic.php?f=9&t=1991855), the
   * custom attributes used to share information about the image are
   * being stripped as the image markup is set into the rich text
   * editor.  Here we encode these attributes into the class field so
   * the data survives.
   *
   * @param imgElement
   *   The image
   * @fid
   *   The file id.
   * @param view_mode
   *   The view mode.
   * @param additional
   *   Additional attributes to add to the image.
   */
  forceAttributesIntoClass: function (imgElement, fid, view_mode, additional) {
    var wysiwyg = imgElement.attr('wysiwyg');
    if (wysiwyg) {
      imgElement.addClass('attr__wysiwyg__' + wysiwyg);
    }
    var format = imgElement.attr('format');
    if (format) {
      imgElement.addClass('attr__format__' + format);
    }
    var typeOf = imgElement.attr('typeof');
    if (typeOf) {
      imgElement.addClass('attr__typeof__' + typeOf);
    }
    if (fid) {
      imgElement.addClass('img__fid__' + fid);
    }
    if (view_mode) {
      imgElement.addClass('img__view_mode__' + view_mode);
    }
    if (additional) {
      for (var name in additional) {
        if (additional.hasOwnProperty(name)) {
          if (name !== 'alt') {
            imgElement.addClass('attr__' + name + '__' + additional[name]);
          }
        }
      }
    }
  },

  /**
   * Retrieves encoded attributes from the specified class string.
   *
   * @param classString
   *   A string containing the value of the class attribute.
   * @return
   *   An array containing the attribute names as keys, and an object
   *   with the name, value, and attribute type (either 'attr' or
   *   'img', depending on whether it is an image attribute or should
   *   be it the attributes section)
   */
  getAttributesFromClass: function (classString) {
    var actualClasses = [];
    var otherAttributes = [];
    var classes = classString.split(' ');
    var regexp = new RegExp('^(attr|img)__([^\S]*)__([^\S]*)$');
    for (var index = 0; index < classes.length; index++) {
      var matches = classes[index].match(regexp);
      if (matches && matches.length === 4) {
        otherAttributes[matches[2]] = {name: matches[2], value: matches[3], type: matches[1]};
      }
      else {
        actualClasses.push(classes[index]);
      }
    }
    if (actualClasses.length > 0) {
      otherAttributes['class'] = {name: 'class', value: actualClasses.join(' '), type: 'attr'};
    }
    return otherAttributes;
  },

  /*
   *
   */
  sortAttributes: function (a, b) {
    var nameA = a.name.toLowerCase();
    var nameB = b.name.toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }
};
}

})(jQuery);
;/**/
/*
 *  JAIL: jQuery Asynchronous Image Loader (brand camp version)
 */
(function ( name, definition ){
  // jquery plugin pattern - AMD + CommonJS - by Addy Osmani (https://github.com/addyosmani/jquery-plugin-patterns/blob/master/amd+commonjs/pluginCore.js)
  var theModule = definition(jQuery),
      hasDefine = typeof define === 'function' && define.amd;

  if ( hasDefine ){
    // AMD module
    define( 'jail', ['jquery'], theModule );

  }  else {
    ( this.jQuery || this.$ || this )[name] = theModule;
  }
}( 'jail', function ($) {
  /*
   * Public function defining 'jail'
   *
   * @param elements : images to load
   * @param options : configurations object
   */
  $.jail = function( elements, options) {
    $('body.page-node img[data-src]:visible').each(function(){
      $img = $(this);
      $img.attr("src", $img.attr("data-src"));
      $img.removeAttr('data-src');
    });
    if (!$isotopePager.hasOwnProperty('getVisible')) {
      return; //pager haven't loaded yet
    }

    $($isotopePager.getVisible()).find('img[data-src]').each(function(){
      $page = $('#page');
      $img = $(this);
      //if (_isInTheScreen($page, $img, 0)) {
        $img.attr("src", $img.attr("data-src"));
        $img.removeAttr('data-src');
      //}
    })
  };

  /*
   * Function that returns true if the image is visible inside the "window" (or specified container element)
   *
   * @param $ct : container - jQuery obj
   * @param $img : image selected - jQuery obj
   * @param optionOffset : offset
   */
  function _isInTheScreen ( $ct, $img, optionOffset ) {
    var is_ct_window  = $ct[0] === window,
        ct_offset  = (is_ct_window ? { top:0, left:0 } : $ct.offset()),
        ct_top     = ct_offset.top + ( is_ct_window ? $ct.scrollTop() : 0),
        ct_left    = ct_offset.left + ( is_ct_window ? $ct.scrollLeft() : 0),
        ct_right   = ct_left + $ct.width(),
        ct_bottom  = ct_top + $ct.height(),
        img_offset = $img.offset(),
        img_width = $img.width(),
        img_height = $img.height();

    return (ct_top - optionOffset) <= (img_offset.top + img_height) &&
        (ct_bottom + optionOffset) >= img_offset.top &&
        (ct_left - optionOffset)<= (img_offset.left + img_width) &&
        (ct_right + optionOffset) >= img_offset.left;
  }

  // Small wrapper
  $.fn.jail = function( options ) {

    new $.jail( this, options );

    // Empty current stack
    currentStack = [];

    return this;
  };

  return $.jail;
}));;/**/
/**
 * @file
 * Theme specific JS file for brand_camp_theme
 */
(function($){
  $('.custom-load-more a').live('click', function(e) {
    $(this).hide();
    $('#block-views-brand-camp-list-block-1').show();
    $.jail();
    return false;
  });

  $(document).ready(function(){
    $(window).resize(function(){
      var $widget = $('.views-exposed-widget, .isoFilters-widget');
      var $formWrp = $('.view-filters, .isoFilters');
      if ($('#page').width() <= 1059) {
        $widget.addClass('tablet-widget');
        assignClick();
        // maybe we should replace it by media-query
        $formWrp.removeClass('desktop');
      }
      else {
        $formWrp.addClass('desktop');
        $widget.removeClass('tablet-widget').removeClass('expanded').attr('style', '');
        $widget.unbind('click');
      }
    });
    $(window).resize();
  });

  function assignClick() {
    // Removes previous event binding to prevent reactions duplicate
    $('.tablet-widget').unbind('click');
    $('.tablet-widget').click(function(e){
      var height = getLabelsHeight($(this));
      if (!$(this).hasClass('expanded')) {
        $(this).siblings().height(50).removeClass('expanded');
        $(this).height(height).addClass('expanded');
      }
      else {
        if (e.target.nodeName == 'LABEL') {
          $('#' + $(e.target).attr('for')).attr('checked', 'checked');
          $('#edit-submit-brand-camp-list').click();
          return;
        }
        $(this).height(50).removeClass('expanded');
      }
    });
  }

  function getLabelsHeight($el) {
    var $labels = $el.find('.views-widget label, .filter');
    var height = $labels.height();
    return height * ($labels.length + 1);
  }

  // animates couple of text slides
  function animateNext(outId, inId) {
    if ('flagIE' in window && flagIE == true) {
      jQuery(outId).animate({
        left: "-1000px",
      }, 1000, function(){
        jQuery(this).hide();
      });
      jQuery(inId).css('left', '1000px').show().animate({
        left: "0",
      }, 1000);

      return;
    }
    jQuery(outId).removeClass('slideInRight').addClass('slideOutLeft');
    jQuery(inId).removeClass('invisible').removeClass('slideOutLeft').addClass('slideInRight');
  }

  //animates array of text slides (id's)
  function animateSlides(slides) {
    var currentSlide = 0;
//    slides.forEach(function (slide) { jQuery(slide).removeClass('invisible') });
    setInterval(function() {
      if (currentSlide == slides.length-1) {
        animateNext(slides[currentSlide], slides[0]);
        currentSlide = 0;
      } else {
        animateNext(slides[currentSlide], slides[currentSlide+1]);
        currentSlide++;
      }
    }, 5000);
  }

  //animate header and footer text slides
  setTimeout(function() {
    animateSlides(['#header1', '#header2', '#header3', '#header4']);
  }, 1000);

  $(document).ready(function() {
    (function addScrollTopButton() {
      $('body').append(
        $('<div></div>')
          .attr({ class: 'scrollTop', id: 'scrollTop' })
          .click(function() {
            window.scrollTo(0, 0);
          })
          .hide()
      );
    })();

    $(window).scroll(function() {
      if ($(this).scrollTop() > 1000 ) {
        $('#scrollTop').fadeIn(400);
      } else {
        $('#scrollTop').fadeOut(400);
      }
    });

    var _windowWidth = 0;
    $(window).resize(function() {
      if (_windowWidth != jQuery(window).width()) {
        _windowWidth = jQuery(window).width();
        jQuery('.page-values-matter .view-brand-camp-list.views-quicksand-container .view-content')
          .css({width: 'auto', height: 'auto'});
      }
    });
  });

})(jQuery);

jQuery.urlParam = function(name){
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results==null){
    return null;
  }
  else{
    return results[1] || 0;
  }
};/**/
/*!
 * Isotope PACKAGED v2.0.1
 * Filter & sort magical layouts
 * http://isotope.metafizzy.co
 */

/**
 * Bridget makes jQuery widgets
 * v1.0.1
 */

( function( window ) {



// -------------------------- utils -------------------------- //

  var slice = Array.prototype.slice;

  function noop() {}

// -------------------------- definition -------------------------- //

  function defineBridget( $ ) {

// bail if no jQuery
    if ( !$ ) {
      return;
    }

// -------------------------- addOptionMethod -------------------------- //

    /**
     * adds option method -> $().plugin('option', {...})
     * @param {Function} PluginClass - constructor class
     */
    function addOptionMethod( PluginClass ) {
      // don't overwrite original option method
      if ( PluginClass.prototype.option ) {
        return;
      }

      // option setter
      PluginClass.prototype.option = function( opts ) {
        // bail out if not an object
        if ( !$.isPlainObject( opts ) ){
          return;
        }
        this.options = $.extend( true, this.options, opts );
      };
    }


// -------------------------- plugin bridge -------------------------- //

// helper function for logging errors
// $.error breaks jQuery chaining
    var logError = typeof console === 'undefined' ? noop :
      function( message ) {
        console.error( message );
      };

    /**
     * jQuery plugin bridge, access methods like $elem.plugin('method')
     * @param {String} namespace - plugin name
     * @param {Function} PluginClass - constructor class
     */
    function bridge( namespace, PluginClass ) {
      // add to jQuery fn namespace
      $.fn[ namespace ] = function( options ) {
        if ( typeof options === 'string' ) {
          // call plugin method when first argument is a string
          // get arguments for method
          var args = slice.call( arguments, 1 );

          for ( var i=0, len = this.length; i < len; i++ ) {
            var elem = this[i];
            var instance = $.data( elem, namespace );
            if ( !instance ) {
              logError( "cannot call methods on " + namespace + " prior to initialization; " +
              "attempted to call '" + options + "'" );
              continue;
            }
            if ( !$.isFunction( instance[options] ) || options.charAt(0) === '_' ) {
              logError( "no such method '" + options + "' for " + namespace + " instance" );
              continue;
            }

            // trigger method with arguments
            var returnValue = instance[ options ].apply( instance, args );

            // break look and return first value if provided
            if ( returnValue !== undefined ) {
              return returnValue;
            }
          }
          // return this if no return value
          return this;
        } else {
          return this.each( function() {
            var instance = $.data( this, namespace );
            if ( instance ) {
              // apply options & init
              instance.option( options );
              instance._init();
            } else {
              // initialize new instance
              instance = new PluginClass( this, options );
              $.data( this, namespace, instance );
            }
          });
        }
      };

    }

// -------------------------- bridget -------------------------- //

    /**
     * converts a Prototypical class into a proper jQuery plugin
     *   the class must have a ._init method
     * @param {String} namespace - plugin name, used in $().pluginName
     * @param {Function} PluginClass - constructor class
     */
    $.bridget = function( namespace, PluginClass ) {
      addOptionMethod( PluginClass );
      bridge( namespace, PluginClass );
    };

    return $.bridget;

  }

// transport
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'jquery-bridget/jquery.bridget',[ 'jquery' ], defineBridget );
  } else {
    // get jquery from browser global
    defineBridget( window.jQuery );
  }

})( window );

/*!
 * eventie v1.0.5
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {



  var docElem = document.documentElement;

  var bind = function() {};

  function getIEEvent( obj ) {
    var event = window.event;
    // add event.target
    event.target = event.target || event.srcElement || obj;
    return event;
  }

  if ( docElem.addEventListener ) {
    bind = function( obj, type, fn ) {
      obj.addEventListener( type, fn, false );
    };
  } else if ( docElem.attachEvent ) {
    bind = function( obj, type, fn ) {
      obj[ type + fn ] = fn.handleEvent ?
        function() {
          var event = getIEEvent( obj );
          fn.handleEvent.call( fn, event );
        } :
        function() {
          var event = getIEEvent( obj );
          fn.call( obj, event );
        };
      obj.attachEvent( "on" + type, obj[ type + fn ] );
    };
  }

  var unbind = function() {};

  if ( docElem.removeEventListener ) {
    unbind = function( obj, type, fn ) {
      obj.removeEventListener( type, fn, false );
    };
  } else if ( docElem.detachEvent ) {
    unbind = function( obj, type, fn ) {
      obj.detachEvent( "on" + type, obj[ type + fn ] );
      try {
        delete obj[ type + fn ];
      } catch ( err ) {
        // can't delete window object properties
        obj[ type + fn ] = undefined;
      }
    };
  }

  var eventie = {
    bind: bind,
    unbind: unbind
  };

// ----- module definition ----- //

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'eventie/eventie',eventie );
  } else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = eventie;
  } else {
    // browser global
    window.eventie = eventie;
  }

})( this );

/*!
 * docReady
 * Cross browser DOMContentLoaded event emitter
 */

/*jshint browser: true, strict: true, undef: true, unused: true*/
/*global define: false */

( function( window ) {



  var document = window.document;
// collection of functions to be triggered on ready
  var queue = [];

  function docReady( fn ) {
    // throw out non-functions
    if ( typeof fn !== 'function' ) {
      return;
    }

    if ( docReady.isReady ) {
      // ready now, hit it
      fn();
    } else {
      // queue function when ready
      queue.push( fn );
    }
  }

  docReady.isReady = false;

// triggered on various doc ready events
  function init( event ) {
    // bail if IE8 document is not ready just yet
    var isIE8NotReady = event.type === 'readystatechange' && document.readyState !== 'complete';
    if ( docReady.isReady || isIE8NotReady ) {
      return;
    }
    docReady.isReady = true;

    // process queue
    for ( var i=0, len = queue.length; i < len; i++ ) {
      var fn = queue[i];
      fn();
    }
  }

  function defineDocReady( eventie ) {
    eventie.bind( document, 'DOMContentLoaded', init );
    eventie.bind( document, 'readystatechange', init );
    eventie.bind( window, 'load', init );

    return docReady;
  }

// transport
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    // if RequireJS, then doc is already ready
    docReady.isReady = typeof requirejs === 'function';
    define( 'doc-ready/doc-ready',[ 'eventie/eventie' ], defineDocReady );
  } else {
    // browser global
    window.docReady = defineDocReady( window.eventie );
  }

})( this );

/*!
 * EventEmitter v4.2.7 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function () {


  /**
   * Class for managing events.
   * Can be extended to provide event functionality in other classes.
   *
   * @class EventEmitter Manages event registering and emitting.
   */
  function EventEmitter() {}

  // Shortcuts to improve speed and size
  var proto = EventEmitter.prototype;
  var exports = this;
  var originalGlobalValue = exports.EventEmitter;

  /**
   * Finds the index of the listener for the event in it's storage array.
   *
   * @param {Function[]} listeners Array of listeners to search through.
   * @param {Function} listener Method to look for.
   * @return {Number} Index of the specified listener, -1 if not found
   * @api private
   */
  function indexOfListener(listeners, listener) {
    var i = listeners.length;
    while (i--) {
      if (listeners[i].listener === listener) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Alias a method while keeping the context correct, to allow for overwriting of target method.
   *
   * @param {String} name The name of the target method.
   * @return {Function} The aliased method
   * @api private
   */
  function alias(name) {
    return function aliasClosure() {
      return this[name].apply(this, arguments);
    };
  }

  /**
   * Returns the listener array for the specified event.
   * Will initialise the event object and listener arrays if required.
   * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
   * Each property in the object response is an array of listener functions.
   *
   * @param {String|RegExp} evt Name of the event to return the listeners from.
   * @return {Function[]|Object} All listener functions for the event.
   */
  proto.getListeners = function getListeners(evt) {
    var events = this._getEvents();
    var response;
    var key;

    // Return a concatenated array of all matching events if
    // the selector is a regular expression.
    if (evt instanceof RegExp) {
      response = {};
      for (key in events) {
        if (events.hasOwnProperty(key) && evt.test(key)) {
          response[key] = events[key];
        }
      }
    }
    else {
      response = events[evt] || (events[evt] = []);
    }

    return response;
  };

  /**
   * Takes a list of listener objects and flattens it into a list of listener functions.
   *
   * @param {Object[]} listeners Raw listener objects.
   * @return {Function[]} Just the listener functions.
   */
  proto.flattenListeners = function flattenListeners(listeners) {
    var flatListeners = [];
    var i;

    for (i = 0; i < listeners.length; i += 1) {
      flatListeners.push(listeners[i].listener);
    }

    return flatListeners;
  };

  /**
   * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
   *
   * @param {String|RegExp} evt Name of the event to return the listeners from.
   * @return {Object} All listener functions for an event in an object.
   */
  proto.getListenersAsObject = function getListenersAsObject(evt) {
    var listeners = this.getListeners(evt);
    var response;

    if (listeners instanceof Array) {
      response = {};
      response[evt] = listeners;
    }

    return response || listeners;
  };

  /**
   * Adds a listener function to the specified event.
   * The listener will not be added if it is a duplicate.
   * If the listener returns true then it will be removed after it is called.
   * If you pass a regular expression as the event name then the listener will be added to all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to attach the listener to.
   * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.addListener = function addListener(evt, listener) {
    var listeners = this.getListenersAsObject(evt);
    var listenerIsWrapped = typeof listener === 'object';
    var key;

    for (key in listeners) {
      if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
        listeners[key].push(listenerIsWrapped ? listener : {
          listener: listener,
          once: false
        });
      }
    }

    return this;
  };

  /**
   * Alias of addListener
   */
  proto.on = alias('addListener');

  /**
   * Semi-alias of addListener. It will add a listener that will be
   * automatically removed after it's first execution.
   *
   * @param {String|RegExp} evt Name of the event to attach the listener to.
   * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.addOnceListener = function addOnceListener(evt, listener) {
    return this.addListener(evt, {
      listener: listener,
      once: true
    });
  };

  /**
   * Alias of addOnceListener.
   */
  proto.once = alias('addOnceListener');

  /**
   * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
   * You need to tell it what event names should be matched by a regex.
   *
   * @param {String} evt Name of the event to create.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.defineEvent = function defineEvent(evt) {
    this.getListeners(evt);
    return this;
  };

  /**
   * Uses defineEvent to define multiple events.
   *
   * @param {String[]} evts An array of event names to define.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.defineEvents = function defineEvents(evts) {
    for (var i = 0; i < evts.length; i += 1) {
      this.defineEvent(evts[i]);
    }
    return this;
  };

  /**
   * Removes a listener function from the specified event.
   * When passed a regular expression as the event name, it will remove the listener from all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to remove the listener from.
   * @param {Function} listener Method to remove from the event.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.removeListener = function removeListener(evt, listener) {
    var listeners = this.getListenersAsObject(evt);
    var index;
    var key;

    for (key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        index = indexOfListener(listeners[key], listener);

        if (index !== -1) {
          listeners[key].splice(index, 1);
        }
      }
    }

    return this;
  };

  /**
   * Alias of removeListener
   */
  proto.off = alias('removeListener');

  /**
   * Adds listeners in bulk using the manipulateListeners method.
   * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
   * You can also pass it a regular expression to add the array of listeners to all events that match it.
   * Yeah, this function does quite a bit. That's probably a bad thing.
   *
   * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to add.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.addListeners = function addListeners(evt, listeners) {
    // Pass through to manipulateListeners
    return this.manipulateListeners(false, evt, listeners);
  };

  /**
   * Removes listeners in bulk using the manipulateListeners method.
   * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
   * You can also pass it an event name and an array of listeners to be removed.
   * You can also pass it a regular expression to remove the listeners from all events that match it.
   *
   * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to remove.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.removeListeners = function removeListeners(evt, listeners) {
    // Pass through to manipulateListeners
    return this.manipulateListeners(true, evt, listeners);
  };

  /**
   * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
   * The first argument will determine if the listeners are removed (true) or added (false).
   * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
   * You can also pass it an event name and an array of listeners to be added/removed.
   * You can also pass it a regular expression to manipulate the listeners of all events that match it.
   *
   * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
   * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
    var i;
    var value;
    var single = remove ? this.removeListener : this.addListener;
    var multiple = remove ? this.removeListeners : this.addListeners;

    // If evt is an object then pass each of it's properties to this method
    if (typeof evt === 'object' && !(evt instanceof RegExp)) {
      for (i in evt) {
        if (evt.hasOwnProperty(i) && (value = evt[i])) {
          // Pass the single listener straight through to the singular method
          if (typeof value === 'function') {
            single.call(this, i, value);
          }
          else {
            // Otherwise pass back to the multiple function
            multiple.call(this, i, value);
          }
        }
      }
    }
    else {
      // So evt must be a string
      // And listeners must be an array of listeners
      // Loop over it and pass each one to the multiple method
      i = listeners.length;
      while (i--) {
        single.call(this, evt, listeners[i]);
      }
    }

    return this;
  };

  /**
   * Removes all listeners from a specified event.
   * If you do not specify an event then all listeners will be removed.
   * That means every event will be emptied.
   * You can also pass a regex to remove all events that match it.
   *
   * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.removeEvent = function removeEvent(evt) {
    var type = typeof evt;
    var events = this._getEvents();
    var key;

    // Remove different things depending on the state of evt
    if (type === 'string') {
      // Remove all listeners for the specified event
      delete events[evt];
    }
    else if (evt instanceof RegExp) {
      // Remove all events matching the regex.
      for (key in events) {
        if (events.hasOwnProperty(key) && evt.test(key)) {
          delete events[key];
        }
      }
    }
    else {
      // Remove all listeners in all events
      delete this._events;
    }

    return this;
  };

  /**
   * Alias of removeEvent.
   *
   * Added to mirror the node API.
   */
  proto.removeAllListeners = alias('removeEvent');

  /**
   * Emits an event of your choice.
   * When emitted, every listener attached to that event will be executed.
   * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
   * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
   * So they will not arrive within the array on the other side, they will be separate.
   * You can also pass a regular expression to emit to all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
   * @param {Array} [args] Optional array of arguments to be passed to each listener.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.emitEvent = function emitEvent(evt, args) {
    var listeners = this.getListenersAsObject(evt);
    var listener;
    var i;
    var key;
    var response;

    for (key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        i = listeners[key].length;

        while (i--) {
          // If the listener returns true then it shall be removed from the event
          // The function is executed either with a basic call or an apply if there is an args array
          listener = listeners[key][i];

          if (listener.once === true) {
            this.removeListener(evt, listener.listener);
          }

          response = listener.listener.apply(this, args || []);

          if (response === this._getOnceReturnValue()) {
            this.removeListener(evt, listener.listener);
          }
        }
      }
    }

    return this;
  };

  /**
   * Alias of emitEvent
   */
  proto.trigger = alias('emitEvent');

  /**
   * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
   * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
   *
   * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
   * @param {...*} Optional additional arguments to be passed to each listener.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.emit = function emit(evt) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.emitEvent(evt, args);
  };

  /**
   * Sets the current value to check against when executing listeners. If a
   * listeners return value matches the one set here then it will be removed
   * after execution. This value defaults to true.
   *
   * @param {*} value The new value to check for when executing listeners.
   * @return {Object} Current instance of EventEmitter for chaining.
   */
  proto.setOnceReturnValue = function setOnceReturnValue(value) {
    this._onceReturnValue = value;
    return this;
  };

  /**
   * Fetches the current value to check against when executing listeners. If
   * the listeners return value matches this one then it should be removed
   * automatically. It will return true by default.
   *
   * @return {*|Boolean} The current value to check for or the default, true.
   * @api private
   */
  proto._getOnceReturnValue = function _getOnceReturnValue() {
    if (this.hasOwnProperty('_onceReturnValue')) {
      return this._onceReturnValue;
    }
    else {
      return true;
    }
  };

  /**
   * Fetches the events object and creates one if required.
   *
   * @return {Object} The events storage object.
   * @api private
   */
  proto._getEvents = function _getEvents() {
    return this._events || (this._events = {});
  };

  /**
   * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
   *
   * @return {Function} Non conflicting EventEmitter class.
   */
  EventEmitter.noConflict = function noConflict() {
    exports.EventEmitter = originalGlobalValue;
    return EventEmitter;
  };

  // Expose the class either via AMD, CommonJS or the global object
  if (typeof define === 'function' && define.amd) {
    define('eventEmitter/EventEmitter',[],function () {
      return EventEmitter;
    });
  }
  else if (typeof module === 'object' && module.exports){
    module.exports = EventEmitter;
  }
  else {
    this.EventEmitter = EventEmitter;
  }
}.call(this));

/*!
 * getStyleProperty v1.0.3
 * original by kangax
 * http://perfectionkills.com/feature-testing-css-properties/
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false, exports: false, module: false */

( function( window ) {



  var prefixes = 'Webkit Moz ms Ms O'.split(' ');
  var docElemStyle = document.documentElement.style;

  function getStyleProperty( propName ) {
    if ( !propName ) {
      return;
    }

    // test standard property first
    if ( typeof docElemStyle[ propName ] === 'string' ) {
      return propName;
    }

    // capitalize
    propName = propName.charAt(0).toUpperCase() + propName.slice(1);

    // test vendor specific properties
    var prefixed;
    for ( var i=0, len = prefixes.length; i < len; i++ ) {
      prefixed = prefixes[i] + propName;
      if ( typeof docElemStyle[ prefixed ] === 'string' ) {
        return prefixed;
      }
    }
  }

// transport
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'get-style-property/get-style-property',[],function() {
      return getStyleProperty;
    });
  } else if ( typeof exports === 'object' ) {
    // CommonJS for Component
    module.exports = getStyleProperty;
  } else {
    // browser global
    window.getStyleProperty = getStyleProperty;
  }

})( window );

/**
 * getSize v1.1.7
 * measure size of elements
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, exports: false, require: false, module: false */

( function( window, undefined ) {



// -------------------------- helpers -------------------------- //

  var getComputedStyle = window.getComputedStyle;
  var getStyle = getComputedStyle ?
    function( elem ) {
      return getComputedStyle( elem, null );
    } :
    function( elem ) {
      return elem.currentStyle;
    };

// get a number from a string, not a percentage
  function getStyleSize( value ) {
    var num = parseFloat( value );
    // not a percent like '100%', and a number
    var isValid = value.indexOf('%') === -1 && !isNaN( num );
    return isValid && num;
  }

// -------------------------- measurements -------------------------- //

  var measurements = [
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingBottom',
    'marginLeft',
    'marginRight',
    'marginTop',
    'marginBottom',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'borderBottomWidth'
  ];

  function getZeroSize() {
    var size = {
      width: 0,
      height: 0,
      innerWidth: 0,
      innerHeight: 0,
      outerWidth: 0,
      outerHeight: 0
    };
    for ( var i=0, len = measurements.length; i < len; i++ ) {
      var measurement = measurements[i];
      size[ measurement ] = 0;
    }
    return size;
  }



  function defineGetSize( getStyleProperty ) {

// -------------------------- box sizing -------------------------- //

    var boxSizingProp = getStyleProperty('boxSizing');
    var isBoxSizeOuter;

    /**
     * WebKit measures the outer-width on style.width on border-box elems
     * IE & Firefox measures the inner-width
     */
    ( function() {
      if ( !boxSizingProp ) {
        return;
      }

      var div = document.createElement('div');
      div.style.width = '200px';
      div.style.padding = '1px 2px 3px 4px';
      div.style.borderStyle = 'solid';
      div.style.borderWidth = '1px 2px 3px 4px';
      div.style[ boxSizingProp ] = 'border-box';

      var body = document.body || document.documentElement;
      body.appendChild( div );
      var style = getStyle( div );

      isBoxSizeOuter = getStyleSize( style.width ) === 200;
      body.removeChild( div );
    })();


// -------------------------- getSize -------------------------- //

    function getSize( elem ) {
      // use querySeletor if elem is string
      if ( typeof elem === 'string' ) {
        elem = document.querySelector( elem );
      }

      // do not proceed on non-objects
      if ( !elem || typeof elem !== 'object' || !elem.nodeType ) {
        return;
      }

      var style = getStyle( elem );

      // if hidden, everything is 0
      if ( style.display === 'none' ) {
        return getZeroSize();
      }

      var size = {};
      size.width = elem.offsetWidth;
      size.height = elem.offsetHeight;

      var isBorderBox = size.isBorderBox = !!( boxSizingProp &&
      style[ boxSizingProp ] && style[ boxSizingProp ] === 'border-box' );

      // get all measurements
      for ( var i=0, len = measurements.length; i < len; i++ ) {
        var measurement = measurements[i];
        var value = style[ measurement ];
        value = mungeNonPixel( elem, value );
        var num = parseFloat( value );
        // any 'auto', 'medium' value will be 0
        size[ measurement ] = !isNaN( num ) ? num : 0;
      }

      var paddingWidth = size.paddingLeft + size.paddingRight;
      var paddingHeight = size.paddingTop + size.paddingBottom;
      var marginWidth = size.marginLeft + size.marginRight;
      var marginHeight = size.marginTop + size.marginBottom;
      var borderWidth = size.borderLeftWidth + size.borderRightWidth;
      var borderHeight = size.borderTopWidth + size.borderBottomWidth;

      var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

      // overwrite width and height if we can get it from style
      var styleWidth = getStyleSize( style.width );
      if ( styleWidth !== false ) {
        size.width = styleWidth +
          // add padding and border unless it's already including it
        ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
      }

      var styleHeight = getStyleSize( style.height );
      if ( styleHeight !== false ) {
        size.height = styleHeight +
          // add padding and border unless it's already including it
        ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
      }

      size.innerWidth = size.width - ( paddingWidth + borderWidth );
      size.innerHeight = size.height - ( paddingHeight + borderHeight );

      size.outerWidth = size.width + marginWidth;
      size.outerHeight = size.height + marginHeight;

      return size;
    }

// IE8 returns percent values, not pixels
// taken from jQuery's curCSS
    function mungeNonPixel( elem, value ) {
      // IE8 and has percent value
      if ( getComputedStyle || value.indexOf('%') === -1 ) {
        return value;
      }
      var style = elem.style;
      // Remember the original values
      var left = style.left;
      var rs = elem.runtimeStyle;
      var rsLeft = rs && rs.left;

      // Put in the new values to get a computed value out
      if ( rsLeft ) {
        rs.left = elem.currentStyle.left;
      }
      style.left = value;
      value = style.pixelLeft;

      // Revert the changed values
      style.left = left;
      if ( rsLeft ) {
        rs.left = rsLeft;
      }

      return value;
    }

    return getSize;

  }

// transport
  if ( typeof define === 'function' && define.amd ) {
    // AMD for RequireJS
    define( 'get-size/get-size',[ 'get-style-property/get-style-property' ], defineGetSize );
  } else if ( typeof exports === 'object' ) {
    // CommonJS for Component
    module.exports = defineGetSize( require('get-style-property') );
  } else {
    // browser global
    window.getSize = defineGetSize( window.getStyleProperty );
  }

})( window );

/**
 * matchesSelector helper v1.0.1
 *
 * @name matchesSelector
 *   @param {Element} elem
 *   @param {String} selector
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false */

( function( global, ElemProto ) {



  var matchesMethod = ( function() {
    // check un-prefixed
    if ( ElemProto.matchesSelector ) {
      return 'matchesSelector';
    }
    // check vendor prefixes
    var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

    for ( var i=0, len = prefixes.length; i < len; i++ ) {
      var prefix = prefixes[i];
      var method = prefix + 'MatchesSelector';
      if ( ElemProto[ method ] ) {
        return method;
      }
    }
  })();

  // ----- match ----- //

  function match( elem, selector ) {
    return elem[ matchesMethod ]( selector );
  }

  // ----- appendToFragment ----- //

  function checkParent( elem ) {
    // not needed if already has parent
    if ( elem.parentNode ) {
      return;
    }
    var fragment = document.createDocumentFragment();
    fragment.appendChild( elem );
  }

  // ----- query ----- //

  // fall back to using QSA
  // thx @jonathantneal https://gist.github.com/3062955
  function query( elem, selector ) {
    // append to fragment if no parent
    checkParent( elem );

    // match elem with all selected elems of parent
    var elems = elem.parentNode.querySelectorAll( selector );
    for ( var i=0, len = elems.length; i < len; i++ ) {
      // return true if match
      if ( elems[i] === elem ) {
        return true;
      }
    }
    // otherwise return false
    return false;
  }

  // ----- matchChild ----- //

  function matchChild( elem, selector ) {
    checkParent( elem );
    return match( elem, selector );
  }

  // ----- matchesSelector ----- //

  var matchesSelector;

  if ( matchesMethod ) {
    // IE9 supports matchesSelector, but doesn't work on orphaned elems
    // check for that
    var div = document.createElement('div');
    var supportsOrphans = match( div, 'div' );
    matchesSelector = supportsOrphans ? match : matchChild;
  } else {
    matchesSelector = query;
  }

  // transport
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'matches-selector/matches-selector',[],function() {
      return matchesSelector;
    });
  } else {
    // browser global
    window.matchesSelector = matchesSelector;
  }

})( this, Element.prototype );

/**
 * Outlayer Item
 */

( function( window ) {



// ----- get style ----- //

  var getComputedStyle = window.getComputedStyle;
  var getStyle = getComputedStyle ?
    function( elem ) {
      return getComputedStyle( elem, null );
    } :
    function( elem ) {
      return elem.currentStyle;
    };


// extend objects
  function extend( a, b ) {
    for ( var prop in b ) {
      a[ prop ] = b[ prop ];
    }
    return a;
  }

  function isEmptyObj( obj ) {
    for ( var prop in obj ) {
      return false;
    }
    prop = null;
    return true;
  }

// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
  function toDash( str ) {
    return str.replace( /([A-Z])/g, function( $1 ){
      return '-' + $1.toLowerCase();
    });
  }

// -------------------------- Outlayer definition -------------------------- //

  function outlayerItemDefinition( EventEmitter, getSize, getStyleProperty ) {

// -------------------------- CSS3 support -------------------------- //

    var transitionProperty = getStyleProperty('transition');
    var transformProperty = getStyleProperty('transform');
    var supportsCSS3 = transitionProperty && transformProperty;
    var is3d = !!getStyleProperty('perspective');

    var transitionEndEvent = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'otransitionend',
      transition: 'transitionend'
    }[ transitionProperty ];

// properties that could have vendor prefix
    var prefixableProperties = [
      'transform',
      'transition',
      'transitionDuration',
      'transitionProperty'
    ];

// cache all vendor properties
    var vendorProperties = ( function() {
      var cache = {};
      for ( var i=0, len = prefixableProperties.length; i < len; i++ ) {
        var prop = prefixableProperties[i];
        var supportedProp = getStyleProperty( prop );
        if ( supportedProp && supportedProp !== prop ) {
          cache[ prop ] = supportedProp;
        }
      }
      return cache;
    })();

// -------------------------- Item -------------------------- //

    function Item( element, layout ) {
      if ( !element ) {
        return;
      }

      this.element = element;
      // parent layout class, i.e. Masonry, Isotope, or Packery
      this.layout = layout;
      this.position = {
        x: 0,
        y: 0
      };

      this._create();
    }

// inherit EventEmitter
    extend( Item.prototype, EventEmitter.prototype );

    Item.prototype._create = function() {
      // transition objects
      this._transn = {
        ingProperties: {},
        clean: {},
        onEnd: {}
      };

      this.css({
        position: 'absolute'
      });
    };

// trigger specified handler for event type
    Item.prototype.handleEvent = function( event ) {
      var method = 'on' + event.type;
      if ( this[ method ] ) {
        this[ method ]( event );
      }
    };

    Item.prototype.getSize = function() {
      this.size = getSize( this.element );
    };

    /**
     * apply CSS styles to element
     * @param {Object} style
     */
    Item.prototype.css = function( style ) {
      var elemStyle = this.element.style;

      for ( var prop in style ) {
        // use vendor property if available
        var supportedProp = vendorProperties[ prop ] || prop;
        elemStyle[ supportedProp ] = style[ prop ];
      }
    };

    // measure position, and sets it
    Item.prototype.getPosition = function() {
      var style = getStyle( this.element );
      var layoutOptions = this.layout.options;
      var isOriginLeft = layoutOptions.isOriginLeft;
      var isOriginTop = layoutOptions.isOriginTop;
      var x = parseInt( style[ isOriginLeft ? 'left' : 'right' ], 10 );
      var y = parseInt( style[ isOriginTop ? 'top' : 'bottom' ], 10 );

      // clean up 'auto' or other non-integer values
      x = isNaN( x ) ? 0 : x;
      y = isNaN( y ) ? 0 : y;
      // remove padding from measurement
      var layoutSize = this.layout.size;
      x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
      y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

      this.position.x = x;
      this.position.y = y;
    };

// set settled position, apply padding
    Item.prototype.layoutPosition = function() {
      var layoutSize = this.layout.size;
      var layoutOptions = this.layout.options;
      var style = {};

      if ( layoutOptions.isOriginLeft ) {
        style.left = ( this.position.x + layoutSize.paddingLeft ) + 'px';
        // reset other property
        style.right = '';
      } else {
        style.right = ( this.position.x + layoutSize.paddingRight ) + 'px';
        style.left = '';
      }

      if ( layoutOptions.isOriginTop ) {
        style.top = ( this.position.y + layoutSize.paddingTop ) + 'px';
        style.bottom = '';
      } else {
        style.bottom = ( this.position.y + layoutSize.paddingBottom ) + 'px';
        style.top = '';
      }

      this.css( style );
      this.emitEvent( 'layout', [ this ] );
    };


// transform translate function
    var translate = is3d ?
      function( x, y ) {
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      } :
      function( x, y ) {
        return 'translate(' + x + 'px, ' + y + 'px)';
      };


    Item.prototype._transitionTo = function( x, y ) {
      this.getPosition();
      // get current x & y from top/left
      var curX = this.position.x;
      var curY = this.position.y;

      var compareX = parseInt( x, 10 );
      var compareY = parseInt( y, 10 );
      var didNotMove = compareX === this.position.x && compareY === this.position.y;

      // save end position
      this.setPosition( x, y );

      // if did not move and not transitioning, just go to layout
      if ( didNotMove && !this.isTransitioning ) {
        this.layoutPosition();
        return;
      }

      var transX = x - curX;
      var transY = y - curY;
      var transitionStyle = {};
      // flip cooridinates if origin on right or bottom
      var layoutOptions = this.layout.options;
      transX = layoutOptions.isOriginLeft ? transX : -transX;
      transY = layoutOptions.isOriginTop ? transY : -transY;
      transitionStyle.transform = translate( transX, transY );

      this.transition({
        to: transitionStyle,
        onTransitionEnd: {
          transform: this.layoutPosition
        },
        isCleaning: true
      });
    };

// non transition + transform support
    Item.prototype.goTo = function( x, y ) {
      this.setPosition( x, y );
      this.layoutPosition();
    };

// use transition and transforms if supported
    Item.prototype.moveTo = supportsCSS3 ?
      Item.prototype._transitionTo : Item.prototype.goTo;

    Item.prototype.setPosition = function( x, y ) {
      this.position.x = parseInt( x, 10 );
      this.position.y = parseInt( y, 10 );
    };

// ----- transition ----- //

    /**
     * @param {Object} style - CSS
     * @param {Function} onTransitionEnd
     */

// non transition, just trigger callback
    Item.prototype._nonTransition = function( args ) {
      this.css( args.to );
      if ( args.isCleaning ) {
        this._removeStyles( args.to );
      }
      for ( var prop in args.onTransitionEnd ) {
        args.onTransitionEnd[ prop ].call( this );
      }
    };

    /**
     * proper transition
     * @param {Object} args - arguments
     *   @param {Object} to - style to transition to
     *   @param {Object} from - style to start transition from
     *   @param {Boolean} isCleaning - removes transition styles after transition
     *   @param {Function} onTransitionEnd - callback
     */
    Item.prototype._transition = function( args ) {
      // redirect to nonTransition if no transition duration
      if ( !parseFloat( this.layout.options.transitionDuration ) ) {
        this._nonTransition( args );
        return;
      }

      var _transition = this._transn;
      // keep track of onTransitionEnd callback by css property
      for ( var prop in args.onTransitionEnd ) {
        _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
      }
      // keep track of properties that are transitioning
      for ( prop in args.to ) {
        _transition.ingProperties[ prop ] = true;
        // keep track of properties to clean up when transition is done
        if ( args.isCleaning ) {
          _transition.clean[ prop ] = true;
        }
      }

      // set from styles
      if ( args.from ) {
        this.css( args.from );
        // force redraw. http://blog.alexmaccaw.com/css-transitions
        var h = this.element.offsetHeight;
        // hack for JSHint to hush about unused var
        h = null;
      }
      // enable transition
      this.enableTransition( args.to );
      // set styles that are transitioning
      this.css( args.to );

      this.isTransitioning = true;

    };

    var itemTransitionProperties = transformProperty && ( toDash( transformProperty ) +
      ',opacity' );

    Item.prototype.enableTransition = function(/* style */) {
      // only enable if not already transitioning
      // bug in IE10 were re-setting transition style will prevent
      // transitionend event from triggering
      if ( this.isTransitioning ) {
        return;
      }

      // make transition: foo, bar, baz from style object
      // TODO uncomment this bit when IE10 bug is resolved
      // var transitionValue = [];
      // for ( var prop in style ) {
      //   // dash-ify camelCased properties like WebkitTransition
      //   transitionValue.push( toDash( prop ) );
      // }
      // enable transition styles
      // HACK always enable transform,opacity for IE10
      this.css({
        transitionProperty: itemTransitionProperties,
        transitionDuration: this.layout.options.transitionDuration
      });
      // listen for transition end event
      this.element.addEventListener( transitionEndEvent, this, false );
    };

    Item.prototype.transition = Item.prototype[ transitionProperty ? '_transition' : '_nonTransition' ];

// ----- events ----- //

    Item.prototype.onwebkitTransitionEnd = function( event ) {
      this.ontransitionend( event );
    };

    Item.prototype.onotransitionend = function( event ) {
      this.ontransitionend( event );
    };

// properties that I munge to make my life easier
    var dashedVendorProperties = {
      '-webkit-transform': 'transform',
      '-moz-transform': 'transform',
      '-o-transform': 'transform'
    };

    Item.prototype.ontransitionend = function( event ) {
      // disregard bubbled events from children
      if ( event.target !== this.element ) {
        return;
      }
      var _transition = this._transn;
      // get property name of transitioned property, convert to prefix-free
      var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

      // remove property that has completed transitioning
      delete _transition.ingProperties[ propertyName ];
      // check if any properties are still transitioning
      if ( isEmptyObj( _transition.ingProperties ) ) {
        // all properties have completed transitioning
        this.disableTransition();
      }
      // clean style
      if ( propertyName in _transition.clean ) {
        // clean up style
        this.element.style[ event.propertyName ] = '';
        delete _transition.clean[ propertyName ];
      }
      // trigger onTransitionEnd callback
      if ( propertyName in _transition.onEnd ) {
        var onTransitionEnd = _transition.onEnd[ propertyName ];
        onTransitionEnd.call( this );
        delete _transition.onEnd[ propertyName ];
      }

      this.emitEvent( 'transitionEnd', [ this ] );
    };

    Item.prototype.disableTransition = function() {
      this.removeTransitionStyles();
      this.element.removeEventListener( transitionEndEvent, this, false );
      this.isTransitioning = false;
    };

    /**
     * removes style property from element
     * @param {Object} style
     **/
    Item.prototype._removeStyles = function( style ) {
      // clean up transition styles
      var cleanStyle = {};
      for ( var prop in style ) {
        cleanStyle[ prop ] = '';
      }
      this.css( cleanStyle );
    };

    var cleanTransitionStyle = {
      transitionProperty: '',
      transitionDuration: ''
    };

    Item.prototype.removeTransitionStyles = function() {
      // remove transition
      this.css( cleanTransitionStyle );
    };

// ----- show/hide/remove ----- //

// remove element from DOM
    Item.prototype.removeElem = function() {
      this.element.parentNode.removeChild( this.element );
      this.emitEvent( 'remove', [ this ] );
    };

    Item.prototype.remove = function() {
      // just remove element if no transition support or no transition
      if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
        this.removeElem();
        return;
      }

      // start transition
      var _this = this;
      this.on( 'transitionEnd', function() {
        _this.removeElem();
        return true; // bind once
      });
      this.hide();
    };

    Item.prototype.reveal = function() {
      delete this.isHidden;
      // remove display: none
      this.css({ display: '' });

      var options = this.layout.options;
      this.transition({
        from: options.hiddenStyle,
        to: options.visibleStyle,
        isCleaning: true
      });
    };

    Item.prototype.hide = function() {
      // set flag
      this.isHidden = true;
      // remove display: none
      this.css({ display: '' });

      var options = this.layout.options;
      this.transition({
        from: options.visibleStyle,
        to: options.hiddenStyle,
        // keep hidden stuff hidden
        isCleaning: true,
        onTransitionEnd: {
          opacity: function() {
            // check if still hidden
            // during transition, item may have been un-hidden
            if ( this.isHidden ) {
              this.css({ display: 'none' });
            }
          }
        }
      });
    };

    Item.prototype.destroy = function() {
      this.css({
        position: '',
        left: '',
        right: '',
        top: '',
        bottom: '',
        transition: '',
        transform: ''
      });
    };

    return Item;

  }

// -------------------------- transport -------------------------- //

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'outlayer/item',[
        'eventEmitter/EventEmitter',
        'get-size/get-size',
        'get-style-property/get-style-property'
      ],
      outlayerItemDefinition );
  } else {
    // browser global
    window.Outlayer = {};
    window.Outlayer.Item = outlayerItemDefinition(
      window.EventEmitter,
      window.getSize,
      window.getStyleProperty
    );
  }

})( window );

/*!
 * Outlayer v1.2.0
 * the brains and guts of a layout library
 * MIT license
 */

( function( window ) {



// ----- vars ----- //

  var document = window.document;
  var console = window.console;
  var jQuery = window.jQuery;

  var noop = function() {};

// -------------------------- helpers -------------------------- //

// extend objects
  function extend( a, b ) {
    for ( var prop in b ) {
      a[ prop ] = b[ prop ];
    }
    return a;
  }


  var objToString = Object.prototype.toString;
  function isArray( obj ) {
    return objToString.call( obj ) === '[object Array]';
  }

// turn element or nodeList into an array
  function makeArray( obj ) {
    var ary = [];
    if ( isArray( obj ) ) {
      // use object if already an array
      ary = obj;
    } else if ( obj && typeof obj.length === 'number' ) {
      // convert nodeList to array
      for ( var i=0, len = obj.length; i < len; i++ ) {
        ary.push( obj[i] );
      }
    } else {
      // array of single index
      ary.push( obj );
    }
    return ary;
  }

// http://stackoverflow.com/a/384380/182183
  var isElement = ( typeof HTMLElement === 'object' ) ?
    function isElementDOM2( obj ) {
      return obj instanceof HTMLElement;
    } :
    function isElementQuirky( obj ) {
      return obj && typeof obj === 'object' &&
        obj.nodeType === 1 && typeof obj.nodeName === 'string';
    };

// index of helper cause IE8
  var indexOf = Array.prototype.indexOf ? function( ary, obj ) {
    return ary.indexOf( obj );
  } : function( ary, obj ) {
    for ( var i=0, len = ary.length; i < len; i++ ) {
      if ( ary[i] === obj ) {
        return i;
      }
    }
    return -1;
  };

  function removeFrom( obj, ary ) {
    var index = indexOf( ary, obj );
    if ( index !== -1 ) {
      ary.splice( index, 1 );
    }
  }

// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
  function toDashed( str ) {
    return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
      return $1 + '-' + $2;
    }).toLowerCase();
  }


  function outlayerDefinition( eventie, docReady, EventEmitter, getSize, matchesSelector, Item ) {

// -------------------------- Outlayer -------------------------- //

// globally unique identifiers
    var GUID = 0;
// internal store of all Outlayer intances
    var instances = {};


    /**
     * @param {Element, String} element
     * @param {Object} options
     * @constructor
     */
    function Outlayer( element, options ) {
      // use element as selector string
      if ( typeof element === 'string' ) {
        element = document.querySelector( element );
      }

      // bail out if not proper element
      if ( !element || !isElement( element ) ) {
        if ( console ) {
          console.error( 'Bad ' + this.constructor.namespace + ' element: ' + element );
        }
        return;
      }

      this.element = element;

      // options
      this.options = extend( {}, this.constructor.defaults );
      this.option( options );

      // add id for Outlayer.getFromElement
      var id = ++GUID;
      this.element.outlayerGUID = id; // expando
      instances[ id ] = this; // associate via id

      // kick it off
      this._create();

      if ( this.options.isInitLayout ) {
        this.layout();
      }
    }

// settings are for internal use only
    Outlayer.namespace = 'outlayer';
    Outlayer.Item = Item;

// default options
    Outlayer.defaults = {
      containerStyle: {
        position: 'relative'
      },
      isInitLayout: true,
      isOriginLeft: true,
      isOriginTop: true,
      isResizeBound: true,
      isResizingContainer: true,
      // item options
      transitionDuration: '0.4s',
      hiddenStyle: {
        opacity: 0,
        transform: 'scale(0.001)'
      },
      visibleStyle: {
        opacity: 1,
        transform: 'scale(1)'
      }
    };

// inherit EventEmitter
    extend( Outlayer.prototype, EventEmitter.prototype );

    /**
     * set options
     * @param {Object} opts
     */
    Outlayer.prototype.option = function( opts ) {
      extend( this.options, opts );
    };

    Outlayer.prototype._create = function() {
      // get items from children
      this.reloadItems();
      // elements that affect layout, but are not laid out
      this.stamps = [];
      this.stamp( this.options.stamp );
      // set container style
      extend( this.element.style, this.options.containerStyle );

      // bind resize method
      if ( this.options.isResizeBound ) {
        this.bindResize();
      }
    };

// goes through all children again and gets bricks in proper order
    Outlayer.prototype.reloadItems = function() {
      // collection of item elements
      this.items = this._itemize( this.element.children );
    };


    /**
     * turn elements into Outlayer.Items to be used in layout
     * @param {Array or NodeList or HTMLElement} elems
     * @returns {Array} items - collection of new Outlayer Items
     */
    Outlayer.prototype._itemize = function( elems ) {

      var itemElems = this._filterFindItemElements( elems );
      var Item = this.constructor.Item;

      // create new Outlayer Items for collection
      var items = [];
      for ( var i=0, len = itemElems.length; i < len; i++ ) {
        var elem = itemElems[i];
        var item = new Item( elem, this );
        items.push( item );
      }

      return items;
    };

    /**
     * get item elements to be used in layout
     * @param {Array or NodeList or HTMLElement} elems
     * @returns {Array} items - item elements
     */
    Outlayer.prototype._filterFindItemElements = function( elems ) {
      // make array of elems
      elems = makeArray( elems );
      var itemSelector = this.options.itemSelector;
      var itemElems = [];

      for ( var i=0, len = elems.length; i < len; i++ ) {
        var elem = elems[i];
        // check that elem is an actual element
        if ( !isElement( elem ) ) {
          continue;
        }
        // filter & find items if we have an item selector
        if ( itemSelector ) {
          // filter siblings
          if ( matchesSelector( elem, itemSelector ) ) {
            itemElems.push( elem );
          }
          // find children
          var childElems = elem.querySelectorAll( itemSelector );
          // concat childElems to filterFound array
          for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
            itemElems.push( childElems[j] );
          }
        } else {
          itemElems.push( elem );
        }
      }

      return itemElems;
    };

    /**
     * getter method for getting item elements
     * @returns {Array} elems - collection of item elements
     */
    Outlayer.prototype.getItemElements = function() {
      var elems = [];
      for ( var i=0, len = this.items.length; i < len; i++ ) {
        elems.push( this.items[i].element );
      }
      return elems;
    };

// ----- init & layout ----- //

    /**
     * lays out all items
     */
    Outlayer.prototype.layout = function() {
      this._resetLayout();
      this._manageStamps();

      // don't animate first layout
      var isInstant = this.options.isLayoutInstant !== undefined ?
        this.options.isLayoutInstant : !this._isLayoutInited;
      this.layoutItems( this.items, isInstant );

      // flag for initalized
      this._isLayoutInited = true;
    };

// _init is alias for layout
    Outlayer.prototype._init = Outlayer.prototype.layout;

    /**
     * logic before any new layout
     */
    Outlayer.prototype._resetLayout = function() {
      this.getSize();
    };


    Outlayer.prototype.getSize = function() {
      this.size = getSize( this.element );
    };

    /**
     * get measurement from option, for columnWidth, rowHeight, gutter
     * if option is String -> get element from selector string, & get size of element
     * if option is Element -> get size of element
     * else use option as a number
     *
     * @param {String} measurement
     * @param {String} size - width or height
     * @private
     */
    Outlayer.prototype._getMeasurement = function( measurement, size ) {
      var option = this.options[ measurement ];
      var elem;
      if ( !option ) {
        // default to 0
        this[ measurement ] = 0;
      } else {
        // use option as an element
        if ( typeof option === 'string' ) {
          elem = this.element.querySelector( option );
        } else if ( isElement( option ) ) {
          elem = option;
        }
        // use size of element, if element
        this[ measurement ] = elem ? getSize( elem )[ size ] : option;
      }
    };

    /**
     * layout a collection of item elements
     * @api public
     */
    Outlayer.prototype.layoutItems = function( items, isInstant ) {
      items = this._getItemsForLayout( items );

      this._layoutItems( items, isInstant );

      this._postLayout();
    };

    /**
     * get the items to be laid out
     * you may want to skip over some items
     * @param {Array} items
     * @returns {Array} items
     */
    Outlayer.prototype._getItemsForLayout = function( items ) {
      var layoutItems = [];
      for ( var i=0, len = items.length; i < len; i++ ) {
        var item = items[i];
        if ( !item.isIgnored ) {
          layoutItems.push( item );
        }
      }
      return layoutItems;
    };

    /**
     * layout items
     * @param {Array} items
     * @param {Boolean} isInstant
     */
    Outlayer.prototype._layoutItems = function( items, isInstant ) {
      var _this = this;
      function onItemsLayout() {
        _this.emitEvent( 'layoutComplete', [ _this, items ] );
      }

      if ( !items || !items.length ) {
        // no items, emit event with empty array
        onItemsLayout();
        return;
      }

      // emit layoutComplete when done
      this._itemsOn( items, 'layout', onItemsLayout );

      var queue = [];

      for ( var i=0, len = items.length; i < len; i++ ) {
        var item = items[i];
        // get x/y object from method
        var position = this._getItemLayoutPosition( item );
        // enqueue
        position.item = item;
        position.isInstant = isInstant || item.isLayoutInstant;
        queue.push( position );
      }

      this._processLayoutQueue( queue );
    };

    /**
     * get item layout position
     * @param {Outlayer.Item} item
     * @returns {Object} x and y position
     */
    Outlayer.prototype._getItemLayoutPosition = function( /* item */ ) {
      return {
        x: 0,
        y: 0
      };
    };

    /**
     * iterate over array and position each item
     * Reason being - separating this logic prevents 'layout invalidation'
     * thx @paul_irish
     * @param {Array} queue
     */
    Outlayer.prototype._processLayoutQueue = function( queue ) {
      for ( var i=0, len = queue.length; i < len; i++ ) {
        var obj = queue[i];
        this._positionItem( obj.item, obj.x, obj.y, obj.isInstant );
      }
    };

    /**
     * Sets position of item in DOM
     * @param {Outlayer.Item} item
     * @param {Number} x - horizontal position
     * @param {Number} y - vertical position
     * @param {Boolean} isInstant - disables transitions
     */
    Outlayer.prototype._positionItem = function( item, x, y, isInstant ) {
      if ( isInstant ) {
        // if not transition, just set CSS
        item.goTo( x, y );
      } else {
        item.moveTo( x, y );
      }
    };

    /**
     * Any logic you want to do after each layout,
     * i.e. size the container
     */
    Outlayer.prototype._postLayout = function() {
      this.resizeContainer();
    };

    Outlayer.prototype.resizeContainer = function() {
      if ( !this.options.isResizingContainer ) {
        return;
      }
      var size = this._getContainerSize();
      if ( size ) {
        this._setContainerMeasure( size.width, true );
        this._setContainerMeasure( size.height, false );
      }
    };

    /**
     * Sets width or height of container if returned
     * @returns {Object} size
     *   @param {Number} width
     *   @param {Number} height
     */
    Outlayer.prototype._getContainerSize = noop;

    /**
     * @param {Number} measure - size of width or height
     * @param {Boolean} isWidth
     */
    Outlayer.prototype._setContainerMeasure = function( measure, isWidth ) {
      if ( measure === undefined ) {
        return;
      }

      var elemSize = this.size;
      // add padding and border width if border box
      if ( elemSize.isBorderBox ) {
        measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
        elemSize.borderLeftWidth + elemSize.borderRightWidth :
        elemSize.paddingBottom + elemSize.paddingTop +
        elemSize.borderTopWidth + elemSize.borderBottomWidth;
      }

      measure = Math.max( measure, 0 );
      this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
    };

    /**
     * trigger a callback for a collection of items events
     * @param {Array} items - Outlayer.Items
     * @param {String} eventName
     * @param {Function} callback
     */
    Outlayer.prototype._itemsOn = function( items, eventName, callback ) {
      var doneCount = 0;
      var count = items.length;
      // event callback
      var _this = this;
      function tick() {
        doneCount++;
        if ( doneCount === count ) {
          callback.call( _this );
        }
        return true; // bind once
      }
      // bind callback
      for ( var i=0, len = items.length; i < len; i++ ) {
        var item = items[i];
        item.on( eventName, tick );
      }
    };

// -------------------------- ignore & stamps -------------------------- //


    /**
     * keep item in collection, but do not lay it out
     * ignored items do not get skipped in layout
     * @param {Element} elem
     */
    Outlayer.prototype.ignore = function( elem ) {
      var item = this.getItem( elem );
      if ( item ) {
        item.isIgnored = true;
      }
    };

    /**
     * return item to layout collection
     * @param {Element} elem
     */
    Outlayer.prototype.unignore = function( elem ) {
      var item = this.getItem( elem );
      if ( item ) {
        delete item.isIgnored;
      }
    };

    /**
     * adds elements to stamps
     * @param {NodeList, Array, Element, or String} elems
     */
    Outlayer.prototype.stamp = function( elems ) {
      elems = this._find( elems );
      if ( !elems ) {
        return;
      }

      this.stamps = this.stamps.concat( elems );
      // ignore
      for ( var i=0, len = elems.length; i < len; i++ ) {
        var elem = elems[i];
        this.ignore( elem );
      }
    };

    /**
     * removes elements to stamps
     * @param {NodeList, Array, or Element} elems
     */
    Outlayer.prototype.unstamp = function( elems ) {
      elems = this._find( elems );
      if ( !elems ){
        return;
      }

      for ( var i=0, len = elems.length; i < len; i++ ) {
        var elem = elems[i];
        // filter out removed stamp elements
        removeFrom( elem, this.stamps );
        this.unignore( elem );
      }

    };

    /**
     * finds child elements
     * @param {NodeList, Array, Element, or String} elems
     * @returns {Array} elems
     */
    Outlayer.prototype._find = function( elems ) {
      if ( !elems ) {
        return;
      }
      // if string, use argument as selector string
      if ( typeof elems === 'string' ) {
        elems = this.element.querySelectorAll( elems );
      }
      elems = makeArray( elems );
      return elems;
    };

    Outlayer.prototype._manageStamps = function() {
      if ( !this.stamps || !this.stamps.length ) {
        return;
      }

      this._getBoundingRect();

      for ( var i=0, len = this.stamps.length; i < len; i++ ) {
        var stamp = this.stamps[i];
        this._manageStamp( stamp );
      }
    };

// update boundingLeft / Top
    Outlayer.prototype._getBoundingRect = function() {
      // get bounding rect for container element
      var boundingRect = this.element.getBoundingClientRect();
      var size = this.size;
      this._boundingRect = {
        left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
        top: boundingRect.top + size.paddingTop + size.borderTopWidth,
        right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
        bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
      };
    };

    /**
     * @param {Element} stamp
     **/
    Outlayer.prototype._manageStamp = noop;

    /**
     * get x/y position of element relative to container element
     * @param {Element} elem
     * @returns {Object} offset - has left, top, right, bottom
     */
    Outlayer.prototype._getElementOffset = function( elem ) {
      var boundingRect = elem.getBoundingClientRect();
      var thisRect = this._boundingRect;
      var size = getSize( elem );
      var offset = {
        left: boundingRect.left - thisRect.left - size.marginLeft,
        top: boundingRect.top - thisRect.top - size.marginTop,
        right: thisRect.right - boundingRect.right - size.marginRight,
        bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
      };
      return offset;
    };

// -------------------------- resize -------------------------- //

// enable event handlers for listeners
// i.e. resize -> onresize
    Outlayer.prototype.handleEvent = function( event ) {
      var method = 'on' + event.type;
      if ( this[ method ] ) {
        this[ method ]( event );
      }
    };

    /**
     * Bind layout to window resizing
     */
    Outlayer.prototype.bindResize = function() {
      // bind just one listener
      if ( this.isResizeBound ) {
        return;
      }
      eventie.bind( window, 'resize', this );
      this.isResizeBound = true;
    };

    /**
     * Unbind layout to window resizing
     */
    Outlayer.prototype.unbindResize = function() {
      if ( this.isResizeBound ) {
        eventie.unbind( window, 'resize', this );
      }
      this.isResizeBound = false;
    };

// original debounce by John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/

// this fires every resize
    Outlayer.prototype.onresize = function() {
      if ( this.resizeTimeout ) {
        clearTimeout( this.resizeTimeout );
      }

      var _this = this;
      function delayed() {
        _this.resize();
        delete _this.resizeTimeout;
      }

      this.resizeTimeout = setTimeout( delayed, 100 );
    };

// debounced, layout on resize
    Outlayer.prototype.resize = function() {
      // don't trigger if size did not change
      // or if resize was unbound. See #9
      if ( !this.isResizeBound || !this.needsResizeLayout() ) {
        return;
      }

      this.layout();
    };

    /**
     * check if layout is needed post layout
     * @returns Boolean
     */
    Outlayer.prototype.needsResizeLayout = function() {
      var size = getSize( this.element );
      // check that this.size and size are there
      // IE8 triggers resize on body size change, so they might not be
      var hasSizes = this.size && size;
      return hasSizes && size.innerWidth !== this.size.innerWidth;
    };

// -------------------------- methods -------------------------- //

    /**
     * add items to Outlayer instance
     * @param {Array or NodeList or Element} elems
     * @returns {Array} items - Outlayer.Items
     **/
    Outlayer.prototype.addItems = function( elems ) {
      var items = this._itemize( elems );
      // add items to collection
      if ( items.length ) {
        this.items = this.items.concat( items );
      }
      return items;
    };

    /**
     * Layout newly-appended item elements
     * @param {Array or NodeList or Element} elems
     */
    Outlayer.prototype.appended = function( elems ) {
      var items = this.addItems( elems );
      if ( !items.length ) {
        return;
      }
      // layout and reveal just the new items
      this.layoutItems( items, true );
      this.reveal( items );
    };

    /**
     * Layout prepended elements
     * @param {Array or NodeList or Element} elems
     */
    Outlayer.prototype.prepended = function( elems ) {
      var items = this._itemize( elems );
      if ( !items.length ) {
        return;
      }
      // add items to beginning of collection
      var previousItems = this.items.slice(0);
      this.items = items.concat( previousItems );
      // start new layout
      this._resetLayout();
      this._manageStamps();
      // layout new stuff without transition
      this.layoutItems( items, true );
      this.reveal( items );
      // layout previous items
      this.layoutItems( previousItems );
    };

    /**
     * reveal a collection of items
     * @param {Array of Outlayer.Items} items
     */
    Outlayer.prototype.reveal = function( items ) {
      var len = items && items.length;
      if ( !len ) {
        return;
      }
      for ( var i=0; i < len; i++ ) {
        var item = items[i];
        item.reveal();
      }
    };

    /**
     * hide a collection of items
     * @param {Array of Outlayer.Items} items
     */
    Outlayer.prototype.hide = function( items ) {
      var len = items && items.length;
      if ( !len ) {
        return;
      }
      for ( var i=0; i < len; i++ ) {
        var item = items[i];
        item.hide();
      }
    };

    /**
     * get Outlayer.Item, given an Element
     * @param {Element} elem
     * @param {Function} callback
     * @returns {Outlayer.Item} item
     */
    Outlayer.prototype.getItem = function( elem ) {
      // loop through items to get the one that matches
      for ( var i=0, len = this.items.length; i < len; i++ ) {
        var item = this.items[i];
        if ( item.element === elem ) {
          // return item
          return item;
        }
      }
    };

    /**
     * get collection of Outlayer.Items, given Elements
     * @param {Array} elems
     * @returns {Array} items - Outlayer.Items
     */
    Outlayer.prototype.getItems = function( elems ) {
      if ( !elems || !elems.length ) {
        return;
      }
      var items = [];
      for ( var i=0, len = elems.length; i < len; i++ ) {
        var elem = elems[i];
        var item = this.getItem( elem );
        if ( item ) {
          items.push( item );
        }
      }

      return items;
    };

    /**
     * remove element(s) from instance and DOM
     * @param {Array or NodeList or Element} elems
     */
    Outlayer.prototype.remove = function( elems ) {
      elems = makeArray( elems );

      var removeItems = this.getItems( elems );
      // bail if no items to remove
      if ( !removeItems || !removeItems.length ) {
        return;
      }

      this._itemsOn( removeItems, 'remove', function() {
        this.emitEvent( 'removeComplete', [ this, removeItems ] );
      });

      for ( var i=0, len = removeItems.length; i < len; i++ ) {
        var item = removeItems[i];
        item.remove();
        // remove item from collection
        removeFrom( item, this.items );
      }
    };

// ----- destroy ----- //

// remove and disable Outlayer instance
    Outlayer.prototype.destroy = function() {
      // clean up dynamic styles
      var style = this.element.style;
      style.height = '';
      style.position = '';
      style.width = '';
      // destroy items
      for ( var i=0, len = this.items.length; i < len; i++ ) {
        var item = this.items[i];
        item.destroy();
      }

      this.unbindResize();

      delete this.element.outlayerGUID;
      // remove data for jQuery
      if ( jQuery ) {
        jQuery.removeData( this.element, this.constructor.namespace );
      }

    };

// -------------------------- data -------------------------- //

    /**
     * get Outlayer instance from element
     * @param {Element} elem
     * @returns {Outlayer}
     */
    Outlayer.data = function( elem ) {
      var id = elem && elem.outlayerGUID;
      return id && instances[ id ];
    };


// -------------------------- create Outlayer class -------------------------- //

    /**
     * create a layout class
     * @param {String} namespace
     */
    Outlayer.create = function( namespace, options ) {
      // sub-class Outlayer
      function Layout() {
        Outlayer.apply( this, arguments );
      }
      // inherit Outlayer prototype, use Object.create if there
      if ( Object.create ) {
        Layout.prototype = Object.create( Outlayer.prototype );
      } else {
        extend( Layout.prototype, Outlayer.prototype );
      }
      // set contructor, used for namespace and Item
      Layout.prototype.constructor = Layout;

      Layout.defaults = extend( {}, Outlayer.defaults );
      // apply new options
      extend( Layout.defaults, options );
      // keep prototype.settings for backwards compatibility (Packery v1.2.0)
      Layout.prototype.settings = {};

      Layout.namespace = namespace;

      Layout.data = Outlayer.data;

      // sub-class Item
      Layout.Item = function LayoutItem() {
        Item.apply( this, arguments );
      };

      Layout.Item.prototype = new Item();

      // -------------------------- declarative -------------------------- //

      /**
       * allow user to initialize Outlayer via .js-namespace class
       * options are parsed from data-namespace-option attribute
       */
      docReady( function() {
        var dashedNamespace = toDashed( namespace );
        var elems = document.querySelectorAll( '.js-' + dashedNamespace );
        var dataAttr = 'data-' + dashedNamespace + '-options';

        for ( var i=0, len = elems.length; i < len; i++ ) {
          var elem = elems[i];
          var attr = elem.getAttribute( dataAttr );
          var options;
          try {
            options = attr && JSON.parse( attr );
          } catch ( error ) {
            // log error, do not initialize
            if ( console ) {
              console.error( 'Error parsing ' + dataAttr + ' on ' +
              elem.nodeName.toLowerCase() + ( elem.id ? '#' + elem.id : '' ) + ': ' +
              error );
            }
            continue;
          }
          // initialize
          var instance = new Layout( elem, options );
          // make available via $().data('layoutname')
          if ( jQuery ) {
            jQuery.data( elem, namespace, instance );
          }
        }
      });

      // -------------------------- jQuery bridge -------------------------- //

      // make into jQuery plugin
      if ( jQuery && jQuery.bridget ) {
        jQuery.bridget( namespace, Layout );
      }

      return Layout;
    };

// ----- fin ----- //

// back in global
    Outlayer.Item = Item;

    return Outlayer;

  }

// -------------------------- transport -------------------------- //

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'outlayer/outlayer',[
        'eventie/eventie',
        'doc-ready/doc-ready',
        'eventEmitter/EventEmitter',
        'get-size/get-size',
        'matches-selector/matches-selector',
        './item'
      ],
      outlayerDefinition );
  } else {
    // browser global
    window.Outlayer = outlayerDefinition(
      window.eventie,
      window.docReady,
      window.EventEmitter,
      window.getSize,
      window.matchesSelector,
      window.Outlayer.Item
    );
  }

})( window );

/**
 * Isotope Item
 **/

( function( window ) {



// -------------------------- Item -------------------------- //

  function itemDefinition( Outlayer ) {

// sub-class Outlayer Item
    function Item() {
      Outlayer.Item.apply( this, arguments );
    }

    Item.prototype = new Outlayer.Item();

    Item.prototype._create = function() {
      // assign id, used for original-order sorting
      this.id = this.layout.itemGUID++;
      Outlayer.Item.prototype._create.call( this );
      this.sortData = {};
    };

    Item.prototype.updateSortData = function() {
      if ( this.isIgnored ) {
        return;
      }
      // default sorters
      this.sortData.id = this.id;
      // for backward compatibility
      this.sortData['original-order'] = this.id;
      this.sortData.random = Math.random();
      // go thru getSortData obj and apply the sorters
      var getSortData = this.layout.options.getSortData;
      var sorters = this.layout._sorters;
      for ( var key in getSortData ) {
        var sorter = sorters[ key ];
        this.sortData[ key ] = sorter( this.element, this );
      }
    };

    var _destroy = Item.prototype.destroy;
    Item.prototype.destroy = function() {
      // call super
      _destroy.apply( this, arguments );
      // reset display, #741
      this.css({
        display: ''
      });
    };

    return Item;

  }

// -------------------------- transport -------------------------- //

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'isotope/js/item',[
        'outlayer/outlayer'
      ],
      itemDefinition );
  } else {
    // browser global
    window.Isotope = window.Isotope || {};
    window.Isotope.Item = itemDefinition(
      window.Outlayer
    );
  }

})( window );

( function( window ) {



// --------------------------  -------------------------- //

  function layoutModeDefinition( getSize, Outlayer ) {

    // layout mode class
    function LayoutMode( isotope ) {
      this.isotope = isotope;
      // link properties
      if ( isotope ) {
        this.options = isotope.options[ this.namespace ];
        this.element = isotope.element;
        this.items = isotope.filteredItems;
        this.size = isotope.size;
      }
    }

    /**
     * some methods should just defer to default Outlayer method
     * and reference the Isotope instance as `this`
     **/
    ( function() {
      var facadeMethods = [
        '_resetLayout',
        '_getItemLayoutPosition',
        '_manageStamp',
        '_getContainerSize',
        '_getElementOffset',
        'needsResizeLayout'
      ];

      for ( var i=0, len = facadeMethods.length; i < len; i++ ) {
        var methodName = facadeMethods[i];
        LayoutMode.prototype[ methodName ] = getOutlayerMethod( methodName );
      }

      function getOutlayerMethod( methodName ) {
        return function() {
          return Outlayer.prototype[ methodName ].apply( this.isotope, arguments );
        };
      }
    })();

    // -----  ----- //

    // for horizontal layout modes, check vertical size
    LayoutMode.prototype.needsVerticalResizeLayout = function() {
      // don't trigger if size did not change
      var size = getSize( this.isotope.element );
      // check that this.size and size are there
      // IE8 triggers resize on body size change, so they might not be
      var hasSizes = this.isotope.size && size;
      return hasSizes && size.innerHeight !== this.isotope.size.innerHeight;
    };

    // ----- measurements ----- //

    LayoutMode.prototype._getMeasurement = function() {
      this.isotope._getMeasurement.apply( this, arguments );
    };

    LayoutMode.prototype.getColumnWidth = function() {
      this.getSegmentSize( 'column', 'Width' );
    };

    LayoutMode.prototype.getRowHeight = function() {
      this.getSegmentSize( 'row', 'Height' );
    };

    /**
     * get columnWidth or rowHeight
     * segment: 'column' or 'row'
     * size 'Width' or 'Height'
     **/
    LayoutMode.prototype.getSegmentSize = function( segment, size ) {
      var segmentName = segment + size;
      var outerSize = 'outer' + size;
      // columnWidth / outerWidth // rowHeight / outerHeight
      this._getMeasurement( segmentName, outerSize );
      // got rowHeight or columnWidth, we can chill
      if ( this[ segmentName ] ) {
        return;
      }
      // fall back to item of first element
      var firstItemSize = this.getFirstItemSize();
      this[ segmentName ] = firstItemSize && firstItemSize[ outerSize ] ||
        // or size of container
      this.isotope.size[ 'inner' + size ];
    };

    LayoutMode.prototype.getFirstItemSize = function() {
      var firstItem = this.isotope.filteredItems[0];
      return firstItem && firstItem.element && getSize( firstItem.element );
    };

    // ----- methods that should reference isotope ----- //

    LayoutMode.prototype.layout = function() {
      this.isotope.layout.apply( this.isotope, arguments );
    };

    LayoutMode.prototype.getSize = function() {
      this.isotope.getSize();
      this.size = this.isotope.size;
    };

    // -------------------------- create -------------------------- //

    LayoutMode.modes = {};

    LayoutMode.create = function( namespace, options ) {

      function Mode() {
        LayoutMode.apply( this, arguments );
      }

      Mode.prototype = new LayoutMode();

      // default options
      if ( options ) {
        Mode.options = options;
      }

      Mode.prototype.namespace = namespace;
      // register in Isotope
      LayoutMode.modes[ namespace ] = Mode;

      return Mode;
    };


    return LayoutMode;

  }

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'isotope/js/layout-mode',[
        'get-size/get-size',
        'outlayer/outlayer'
      ],
      layoutModeDefinition );
  } else {
    // browser global
    window.Isotope = window.Isotope || {};
    window.Isotope.LayoutMode = layoutModeDefinition(
      window.getSize,
      window.Outlayer
    );
  }


})( window );

/*!
 * Masonry v3.1.5
 * Cascading grid layout library
 * http://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

( function( window ) {



// -------------------------- helpers -------------------------- //

  var indexOf = Array.prototype.indexOf ?
    function( items, value ) {
      return items.indexOf( value );
    } :
    function ( items, value ) {
      for ( var i=0, len = items.length; i < len; i++ ) {
        var item = items[i];
        if ( item === value ) {
          return i;
        }
      }
      return -1;
    };

// -------------------------- masonryDefinition -------------------------- //

// used for AMD definition and requires
  function masonryDefinition( Outlayer, getSize ) {
    // create an Outlayer layout class
    var Masonry = Outlayer.create('masonry');

    Masonry.prototype._resetLayout = function() {
      this.getSize();
      this._getMeasurement( 'columnWidth', 'outerWidth' );
      this._getMeasurement( 'gutter', 'outerWidth' );
      this.measureColumns();

      // reset column Y
      var i = this.cols;
      this.colYs = [];
      while (i--) {
        this.colYs.push( 0 );
      }

      this.maxY = 0;
    };

    Masonry.prototype.measureColumns = function() {
      this.getContainerWidth();
      // if columnWidth is 0, default to outerWidth of first item
      if ( !this.columnWidth ) {
        var firstItem = this.items[0];
        var firstItemElem = firstItem && firstItem.element;
        // columnWidth fall back to item of first element
        this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
          // if first elem has no width, default to size of container
        this.containerWidth;
      }

      this.columnWidth += this.gutter;

      this.cols = Math.floor( ( this.containerWidth + this.gutter ) / this.columnWidth );
      this.cols = Math.max( this.cols, 1 );
    };

    Masonry.prototype.getContainerWidth = function() {
      // container is parent if fit width
      var container = this.options.isFitWidth ? this.element.parentNode : this.element;
      // check that this.size and size are there
      // IE8 triggers resize on body size change, so they might not be
      var size = getSize( container );
      this.containerWidth = size && size.innerWidth;
    };

    Masonry.prototype._getItemLayoutPosition = function( item ) {
      item.getSize();
      // how many columns does this brick span
      var remainder = item.size.outerWidth % this.columnWidth;
      var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
      // round if off by 1 pixel, otherwise use ceil
      var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
      colSpan = Math.min( colSpan, this.cols );

      var colGroup = this._getColGroup( colSpan );
      // get the minimum Y value from the columns
      var minimumY = Math.min.apply( Math, colGroup );
      var shortColIndex = indexOf( colGroup, minimumY );

      // position the brick
      var position = {
        x: this.columnWidth * shortColIndex,
        y: minimumY
      };

      // apply setHeight to necessary columns
      var setHeight = minimumY + item.size.outerHeight;
      var setSpan = this.cols + 1 - colGroup.length;
      for ( var i = 0; i < setSpan; i++ ) {
        this.colYs[ shortColIndex + i ] = setHeight;
      }

      return position;
    };

    /**
     * @param {Number} colSpan - number of columns the element spans
     * @returns {Array} colGroup
     */
    Masonry.prototype._getColGroup = function( colSpan ) {
      if ( colSpan < 2 ) {
        // if brick spans only one column, use all the column Ys
        return this.colYs;
      }

      var colGroup = [];
      // how many different places could this brick fit horizontally
      var groupCount = this.cols + 1 - colSpan;
      // for each group potential horizontal position
      for ( var i = 0; i < groupCount; i++ ) {
        // make an array of colY values for that one group
        var groupColYs = this.colYs.slice( i, i + colSpan );
        // and get the max value of the array
        colGroup[i] = Math.max.apply( Math, groupColYs );
      }
      return colGroup;
    };

    Masonry.prototype._manageStamp = function( stamp ) {
      var stampSize = getSize( stamp );
      var offset = this._getElementOffset( stamp );
      // get the columns that this stamp affects
      var firstX = this.options.isOriginLeft ? offset.left : offset.right;
      var lastX = firstX + stampSize.outerWidth;
      var firstCol = Math.floor( firstX / this.columnWidth );
      firstCol = Math.max( 0, firstCol );
      var lastCol = Math.floor( lastX / this.columnWidth );
      // lastCol should not go over if multiple of columnWidth #425
      lastCol -= lastX % this.columnWidth ? 0 : 1;
      lastCol = Math.min( this.cols - 1, lastCol );
      // set colYs to bottom of the stamp
      var stampMaxY = ( this.options.isOriginTop ? offset.top : offset.bottom ) +
        stampSize.outerHeight;
      for ( var i = firstCol; i <= lastCol; i++ ) {
        this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
      }
    };

    Masonry.prototype._getContainerSize = function() {
      this.maxY = Math.max.apply( Math, this.colYs );
      var size = {
        height: this.maxY
      };

      if ( this.options.isFitWidth ) {
        size.width = this._getContainerFitWidth();
      }

      return size;
    };

    Masonry.prototype._getContainerFitWidth = function() {
      var unusedCols = 0;
      // count unused columns
      var i = this.cols;
      while ( --i ) {
        if ( this.colYs[i] !== 0 ) {
          break;
        }
        unusedCols++;
      }
      // fit container to columns that have been used
      return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
    };

    Masonry.prototype.needsResizeLayout = function() {
      var previousWidth = this.containerWidth;
      this.getContainerWidth();
      return previousWidth !== this.containerWidth;
    };

    return Masonry;
  }

// -------------------------- transport -------------------------- //

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'masonry/masonry',[
        'outlayer/outlayer',
        'get-size/get-size'
      ],
      masonryDefinition );
  } else {
    // browser global
    window.Masonry = masonryDefinition(
      window.Outlayer,
      window.getSize
    );
  }

})( window );

/*!
 * Masonry layout mode
 * sub-classes Masonry
 * http://masonry.desandro.com
 */

( function( window ) {



// -------------------------- helpers -------------------------- //

// extend objects
  function extend( a, b ) {
    for ( var prop in b ) {
      a[ prop ] = b[ prop ];
    }
    return a;
  }

// -------------------------- masonryDefinition -------------------------- //

// used for AMD definition and requires
  function masonryDefinition( LayoutMode, Masonry ) {
    // create an Outlayer layout class
    var MasonryMode = LayoutMode.create('masonry');

    // save on to these methods
    var _getElementOffset = MasonryMode.prototype._getElementOffset;
    var layout = MasonryMode.prototype.layout;
    var _getMeasurement = MasonryMode.prototype._getMeasurement;

    // sub-class Masonry
    extend( MasonryMode.prototype, Masonry.prototype );

    // set back, as it was overwritten by Masonry
    MasonryMode.prototype._getElementOffset = _getElementOffset;
    MasonryMode.prototype.layout = layout;
    MasonryMode.prototype._getMeasurement = _getMeasurement;

    var measureColumns = MasonryMode.prototype.measureColumns;
    MasonryMode.prototype.measureColumns = function() {
      // set items, used if measuring first item
      this.items = this.isotope.filteredItems;
      measureColumns.call( this );
    };

    // HACK copy over isOriginLeft/Top options
    var _manageStamp = MasonryMode.prototype._manageStamp;
    MasonryMode.prototype._manageStamp = function() {
      this.options.isOriginLeft = this.isotope.options.isOriginLeft;
      this.options.isOriginTop = this.isotope.options.isOriginTop;
      _manageStamp.apply( this, arguments );
    };

    return MasonryMode;
  }

// -------------------------- transport -------------------------- //

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'isotope/js/layout-modes/masonry',[
        '../layout-mode',
        'masonry/masonry'
      ],
      masonryDefinition );
  } else {
    // browser global
    masonryDefinition(
      window.Isotope.LayoutMode,
      window.Masonry
    );
  }

})( window );

( function( window ) {



  function fitRowsDefinition( LayoutMode ) {

    var FitRows = LayoutMode.create('fitRows');

    FitRows.prototype._resetLayout = function() {
      this.x = 0;
      this.y = 0;
      this.maxY = 0;
    };

    FitRows.prototype._getItemLayoutPosition = function( item ) {
      item.getSize();

      // if this element cannot fit in the current row
      if ( this.x !== 0 && item.size.outerWidth + this.x > this.isotope.size.innerWidth ) {
        this.x = 0;
        this.y = this.maxY;
      }

      var position = {
        x: this.x,
        y: this.y
      };

      this.maxY = Math.max( this.maxY, this.y + item.size.outerHeight );
      this.x += item.size.outerWidth;

      return position;
    };

    FitRows.prototype._getContainerSize = function() {
      return { height: this.maxY };
    };

    return FitRows;

  }

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'isotope/js/layout-modes/fit-rows',[
        '../layout-mode'
      ],
      fitRowsDefinition );
  } else {
    // browser global
    fitRowsDefinition(
      window.Isotope.LayoutMode
    );
  }

})( window );

( function( window ) {



  function verticalDefinition( LayoutMode ) {

    var Vertical = LayoutMode.create( 'vertical', {
      horizontalAlignment: 0
    });

    Vertical.prototype._resetLayout = function() {
      this.y = 0;
    };

    Vertical.prototype._getItemLayoutPosition = function( item ) {
      item.getSize();
      var x = ( this.isotope.size.innerWidth - item.size.outerWidth ) *
        this.options.horizontalAlignment;
      var y = this.y;
      this.y += item.size.outerHeight;
      return { x: x, y: y };
    };

    Vertical.prototype._getContainerSize = function() {
      return { height: this.y };
    };

    return Vertical;

  }

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( 'isotope/js/layout-modes/vertical',[
        '../layout-mode'
      ],
      verticalDefinition );
  } else {
    // browser global
    verticalDefinition(
      window.Isotope.LayoutMode
    );
  }

})( window );

/*!
 * Isotope v2.0.1
 * Filter & sort magical layouts
 * http://isotope.metafizzy.co
 */

( function( window ) {



// -------------------------- vars -------------------------- //

  var jQuery = window.jQuery;

// -------------------------- helpers -------------------------- //

// extend objects
  function extend( a, b ) {
    for ( var prop in b ) {
      a[ prop ] = b[ prop ];
    }
    return a;
  }

  var trim = String.prototype.trim ?
    function( str ) {
      return str.trim();
    } :
    function( str ) {
      return str.replace( /^\s+|\s+$/g, '' );
    };

  var docElem = document.documentElement;

  var getText = docElem.textContent ?
    function( elem ) {
      return elem.textContent;
    } :
    function( elem ) {
      return elem.innerText;
    };

  var objToString = Object.prototype.toString;
  function isArray( obj ) {
    return objToString.call( obj ) === '[object Array]';
  }

// index of helper cause IE8
  var indexOf = Array.prototype.indexOf ? function( ary, obj ) {
    return ary.indexOf( obj );
  } : function( ary, obj ) {
    for ( var i=0, len = ary.length; i < len; i++ ) {
      if ( ary[i] === obj ) {
        return i;
      }
    }
    return -1;
  };

// turn element or nodeList into an array
  function makeArray( obj ) {
    var ary = [];
    if ( isArray( obj ) ) {
      // use object if already an array
      ary = obj;
    } else if ( obj && typeof obj.length === 'number' ) {
      // convert nodeList to array
      for ( var i=0, len = obj.length; i < len; i++ ) {
        ary.push( obj[i] );
      }
    } else {
      // array of single index
      ary.push( obj );
    }
    return ary;
  }

  function removeFrom( obj, ary ) {
    var index = indexOf( ary, obj );
    if ( index !== -1 ) {
      ary.splice( index, 1 );
    }
  }

// -------------------------- isotopeDefinition -------------------------- //

// used for AMD definition and requires
  function isotopeDefinition( Outlayer, getSize, matchesSelector, Item, LayoutMode ) {
    // create an Outlayer layout class
    var Isotope = Outlayer.create( 'isotope', {
      layoutMode: "masonry",
      isJQueryFiltering: true,
      sortAscending: true
    });

    Isotope.Item = Item;
    Isotope.LayoutMode = LayoutMode;

    Isotope.prototype._create = function() {
      this.itemGUID = 0;
      // functions that sort items
      this._sorters = {};
      this._getSorters();
      // call super
      Outlayer.prototype._create.call( this );

      // create layout modes
      this.modes = {};
      // start filteredItems with all items
      this.filteredItems = this.items;
      // keep of track of sortBys
      this.sortHistory = [ 'original-order' ];
      // create from registered layout modes
      for ( var name in LayoutMode.modes ) {
        this._initLayoutMode( name );
      }
    };

    Isotope.prototype.reloadItems = function() {
      // reset item ID counter
      this.itemGUID = 0;
      // call super
      Outlayer.prototype.reloadItems.call( this );
    };

    Isotope.prototype._itemize = function() {
      var items = Outlayer.prototype._itemize.apply( this, arguments );
      // assign ID for original-order
      for ( var i=0, len = items.length; i < len; i++ ) {
        var item = items[i];
        item.id = this.itemGUID++;
      }
      this._updateItemsSortData( items );
      return items;
    };


    // -------------------------- layout -------------------------- //

    Isotope.prototype._initLayoutMode = function( name ) {
      var Mode = LayoutMode.modes[ name ];
      // set mode options
      // HACK extend initial options, back-fill in default options
      var initialOpts = this.options[ name ] || {};
      this.options[ name ] = Mode.options ?
        extend( Mode.options, initialOpts ) : initialOpts;
      // init layout mode instance
      this.modes[ name ] = new Mode( this );
    };


    Isotope.prototype.layout = function() {
      // if first time doing layout, do all magic
      if ( !this._isLayoutInited && this.options.isInitLayout ) {
        this.arrange();
        return;
      }
      this._layout();
    };

    // private method to be used in layout() & magic()
    Isotope.prototype._layout = function() {
      // don't animate first layout
      var isInstant = this._getIsInstant();
      // layout flow
      this._resetLayout();
      this._manageStamps();
      this.layoutItems( this.filteredItems, isInstant );

      // flag for initalized
      this._isLayoutInited = true;
    };

    // filter + sort + layout
    Isotope.prototype.arrange = function( opts ) {
      // set any options pass
      this.option( opts );
      this._getIsInstant();
      // filter, sort, and layout
      this.filteredItems = this._filter( this.items );
      this._sort();
      this._layout();
    };
    // alias to _init for main plugin method
    Isotope.prototype._init = Isotope.prototype.arrange;

    // HACK
    // Don't animate/transition first layout
    // Or don't animate/transition other layouts
    Isotope.prototype._getIsInstant = function() {
      var isInstant = this.options.isLayoutInstant !== undefined ?
        this.options.isLayoutInstant : !this._isLayoutInited;
      this._isInstant = isInstant;
      return isInstant;
    };

    // -------------------------- filter -------------------------- //

    Isotope.prototype._filter = function( items ) {
      var filter = this.options.filter;
      filter = filter || '*';
      var matches = [];
      var hiddenMatched = [];
      var visibleUnmatched = [];

      var test = this._getFilterTest( filter );

      // test each item
      for ( var i=0, len = items.length; i < len; i++ ) {
        var item = items[i];
        if ( item.isIgnored ) {
          continue;
        }
        // add item to either matched or unmatched group
        var isMatched = test( item );
        // item.isFilterMatched = isMatched;
        // add to matches if its a match
        if ( isMatched ) {
          matches.push( item );
        }
        // add to additional group if item needs to be hidden or revealed
        if ( isMatched && item.isHidden ) {
          hiddenMatched.push( item );
        } else if ( !isMatched && !item.isHidden ) {
          visibleUnmatched.push( item );
        }
      }

      var _this = this;
      function hideReveal() {
        _this.reveal( hiddenMatched );
        _this.hide( visibleUnmatched );
      }

      if ( this._isInstant ) {
        this._noTransition( hideReveal );
      } else {
        hideReveal();
      }

      return matches;
    };

    // get a jQuery, function, or a matchesSelector test given the filter
    Isotope.prototype._getFilterTest = function( filter ) {
      if ( jQuery && this.options.isJQueryFiltering ) {
        // use jQuery
        return function( item ) {
          return jQuery( item.element ).is( filter );
        };
      }
      if ( typeof filter === 'function' ) {
        // use filter as function
        return function( item ) {
          return filter( item.element );
        };
      }
      // default, use filter as selector string
      return function( item ) {
        return matchesSelector( item.element, filter );
      };
    };

    // -------------------------- sorting -------------------------- //

    /**
     * @params {Array} elems
     * @public
     */
    Isotope.prototype.updateSortData = function( elems ) {
      this._getSorters();
      // update item sort data
      // default to all items if none are passed in
      elems = makeArray( elems );
      var items = this.getItems( elems );
      // if no items found, update all items
      items = items.length ? items : this.items;
      this._updateItemsSortData( items );
    };

    Isotope.prototype._getSorters = function() {
      var getSortData = this.options.getSortData;
      for ( var key in getSortData ) {
        var sorter = getSortData[ key ];
        this._sorters[ key ] = mungeSorter( sorter );
      }
    };

    /**
     * @params {Array} items - of Isotope.Items
     * @private
     */
    Isotope.prototype._updateItemsSortData = function( items ) {
      for ( var i=0, len = items.length; i < len; i++ ) {
        var item = items[i];
        item.updateSortData();
      }
    };

    // ----- munge sorter ----- //

    // encapsulate this, as we just need mungeSorter
    // other functions in here are just for munging
    var mungeSorter = ( function() {
      // add a magic layer to sorters for convienent shorthands
      // `.foo-bar` will use the text of .foo-bar querySelector
      // `[foo-bar]` will use attribute
      // you can also add parser
      // `.foo-bar parseInt` will parse that as a number
      function mungeSorter( sorter ) {
        // if not a string, return function or whatever it is
        if ( typeof sorter !== 'string' ) {
          return sorter;
        }
        // parse the sorter string
        var args = trim( sorter ).split(' ');
        var query = args[0];
        // check if query looks like [an-attribute]
        var attrMatch = query.match( /^\[(.+)\]$/ );
        var attr = attrMatch && attrMatch[1];
        var getValue = getValueGetter( attr, query );
        // use second argument as a parser
        var parser = Isotope.sortDataParsers[ args[1] ];
        // parse the value, if there was a parser
        sorter = parser ? function( elem ) {
          return elem && parser( getValue( elem ) );
        } :
          // otherwise just return value
          function( elem ) {
            return elem && getValue( elem );
          };

        return sorter;
      }

      // get an attribute getter, or get text of the querySelector
      function getValueGetter( attr, query ) {
        var getValue;
        // if query looks like [foo-bar], get attribute
        if ( attr ) {
          getValue = function( elem ) {
            return elem.getAttribute( attr );
          };
        } else {
          // otherwise, assume its a querySelector, and get its text
          getValue = function( elem ) {
            var child = elem.querySelector( query );
            return child && getText( child );
          };
        }
        return getValue;
      }

      return mungeSorter;
    })();

    // parsers used in getSortData shortcut strings
    Isotope.sortDataParsers = {
      'parseInt': function( val ) {
        return parseInt( val, 10 );
      },
      'parseFloat': function( val ) {
        return parseFloat( val );
      }
    };

    // ----- sort method ----- //

    // sort filteredItem order
    Isotope.prototype._sort = function() {
      var sortByOpt = this.options.sortBy;
      if ( !sortByOpt ) {
        return;
      }
      // concat all sortBy and sortHistory
      var sortBys = [].concat.apply( sortByOpt, this.sortHistory );
      // sort magic
      var itemSorter = getItemSorter( sortBys, this.options.sortAscending );
      this.filteredItems.sort( itemSorter );
      // keep track of sortBy History
      if ( sortByOpt !== this.sortHistory[0] ) {
        // add to front, oldest goes in last
        this.sortHistory.unshift( sortByOpt );
      }
    };

    // returns a function used for sorting
    function getItemSorter( sortBys, sortAsc ) {
      return function sorter( itemA, itemB ) {
        // cycle through all sortKeys
        for ( var i = 0, len = sortBys.length; i < len; i++ ) {
          var sortBy = sortBys[i];
          var a = itemA.sortData[ sortBy ];
          var b = itemB.sortData[ sortBy ];
          if ( a > b || a < b ) {
            // if sortAsc is an object, use the value given the sortBy key
            var isAscending = sortAsc[ sortBy ] !== undefined ? sortAsc[ sortBy ] : sortAsc;
            var direction = isAscending ? 1 : -1;
            return ( a > b ? 1 : -1 ) * direction;
          }
        }
        return 0;
      };
    }

    // -------------------------- methods -------------------------- //

    // get layout mode
    Isotope.prototype._mode = function() {
      var layoutMode = this.options.layoutMode;
      var mode = this.modes[ layoutMode ];
      if ( !mode ) {
        // TODO console.error
        throw new Error( 'No layout mode: ' + layoutMode );
      }
      // HACK sync mode's options
      // any options set after init for layout mode need to be synced
      mode.options = this.options[ layoutMode ];
      return mode;
    };

    Isotope.prototype._resetLayout = function() {
      // trigger original reset layout
      Outlayer.prototype._resetLayout.call( this );
      this._mode()._resetLayout();
    };

    Isotope.prototype._getItemLayoutPosition = function( item  ) {
      return this._mode()._getItemLayoutPosition( item );
    };

    Isotope.prototype._manageStamp = function( stamp ) {
      this._mode()._manageStamp( stamp );
    };

    Isotope.prototype._getContainerSize = function() {
      return this._mode()._getContainerSize();
    };

    Isotope.prototype.needsResizeLayout = function() {
      return this._mode().needsResizeLayout();
    };

    // -------------------------- adding & removing -------------------------- //

    // HEADS UP overwrites default Outlayer appended
    Isotope.prototype.appended = function( elems ) {
      var items = this.addItems( elems );
      if ( !items.length ) {
        return;
      }
      var filteredItems = this._filterRevealAdded( items );
      // add to filteredItems
      this.filteredItems = this.filteredItems.concat( filteredItems );
    };

    // HEADS UP overwrites default Outlayer prepended
    Isotope.prototype.prepended = function( elems ) {
      var items = this._itemize( elems );
      if ( !items.length ) {
        return;
      }
      // add items to beginning of collection
      var previousItems = this.items.slice(0);
      this.items = items.concat( previousItems );
      // start new layout
      this._resetLayout();
      this._manageStamps();
      // layout new stuff without transition
      var filteredItems = this._filterRevealAdded( items );
      // layout previous items
      this.layoutItems( previousItems );
      // add to filteredItems
      this.filteredItems = filteredItems.concat( this.filteredItems );
    };

    Isotope.prototype._filterRevealAdded = function( items ) {
      var filteredItems = this._noTransition( function() {
        return this._filter( items );
      });
      // layout and reveal just the new items
      this.layoutItems( filteredItems, true );
      this.reveal( filteredItems );
      return items;
    };

    /**
     * Filter, sort, and layout newly-appended item elements
     * @param {Array or NodeList or Element} elems
     */
    Isotope.prototype.insert = function( elems ) {
      var items = this.addItems( elems );
      if ( !items.length ) {
        return;
      }
      // append item elements
      var i, item;
      var len = items.length;
      for ( i=0; i < len; i++ ) {
        item = items[i];
        this.element.appendChild( item.element );
      }
      // filter new stuff
      /*
       // this way adds hides new filtered items with NO transition
       // so user can't see if new hidden items have been inserted
       var filteredInsertItems;
       this._noTransition( function() {
       filteredInsertItems = this._filter( items );
       // hide all new items
       this.hide( filteredInsertItems );
       });
       // */
      // this way hides new filtered items with transition
      // so user at least sees that something has been added
      var filteredInsertItems = this._filter( items );
      // hide all newitems
      this._noTransition( function() {
        this.hide( filteredInsertItems );
      });
      // */
      // set flag
      for ( i=0; i < len; i++ ) {
        items[i].isLayoutInstant = true;
      }
      this.arrange();
      // reset flag
      for ( i=0; i < len; i++ ) {
        delete items[i].isLayoutInstant;
      }
      this.reveal( filteredInsertItems );
    };

    var _remove = Isotope.prototype.remove;
    Isotope.prototype.remove = function( elems ) {
      elems = makeArray( elems );
      var removeItems = this.getItems( elems );
      // do regular thing
      _remove.call( this, elems );
      // bail if no items to remove
      if ( !removeItems || !removeItems.length ) {
        return;
      }
      // remove elems from filteredItems
      for ( var i=0, len = removeItems.length; i < len; i++ ) {
        var item = removeItems[i];
        // remove item from collection
        removeFrom( item, this.filteredItems );
      }
    };

    Isotope.prototype.shuffle = function() {
      // update random sortData
      for ( var i=0, len = this.items.length; i < len; i++ ) {
        var item = this.items[i];
        item.sortData.random = Math.random();
      }
      this.options.sortBy = 'random';
      this._sort();
      this._layout();
    };

    /**
     * trigger fn without transition
     * kind of hacky to have this in the first place
     * @param {Function} fn
     * @returns ret
     * @private
     */
    Isotope.prototype._noTransition = function( fn ) {
      // save transitionDuration before disabling
      var transitionDuration = this.options.transitionDuration;
      // disable transition
      this.options.transitionDuration = 0;
      // do it
      var returnValue = fn.call( this );
      // re-enable transition for reveal
      this.options.transitionDuration = transitionDuration;
      return returnValue;
    };

    // ----- helper methods ----- //

    /**
     * getter method for getting filtered item elements
     * @returns {Array} elems - collection of item elements
     */
    Isotope.prototype.getFilteredItemElements = function() {
      var elems = [];
      for ( var i=0, len = this.filteredItems.length; i < len; i++ ) {
        elems.push( this.filteredItems[i].element );
      }
      return elems;
    };

    // -----  ----- //

    return Isotope;
  }

// -------------------------- transport -------------------------- //

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
        'outlayer/outlayer',
        'get-size/get-size',
        'matches-selector/matches-selector',
        'isotope/js/item',
        'isotope/js/layout-mode',
        // include default layout modes
        'isotope/js/layout-modes/masonry',
        'isotope/js/layout-modes/fit-rows',
        'isotope/js/layout-modes/vertical'
      ],
      isotopeDefinition );
  } else {
    // browser global
    window.Isotope = isotopeDefinition(
      window.Outlayer,
      window.getSize,
      window.matchesSelector,
      window.Isotope.Item,
      window.Isotope.LayoutMode
    );
  }

})( window );

/*!
 * cellsByRows layout mode for Isotope
 * http://isotope.metafizzy.co
 */

( function( window ) {

  'use strict';

  function cellsByRowDefinition( LayoutMode ) {

    var CellsByRow = LayoutMode.create( 'cellsByRow' );

    CellsByRow.prototype._resetLayout = function() {
      // reset properties
      this.itemIndex = 0;
      // measurements
      this.getColumnWidth();
      this.getRowHeight();
      // set cols
      this.cols = Math.floor( this.isotope.size.innerWidth / this.columnWidth );
      this.cols = Math.max( this.cols, 1 );
    };

    CellsByRow.prototype._getItemLayoutPosition = function( item ) {
      item.getSize();
      var col = this.itemIndex % this.cols;
      var row = Math.floor( this.itemIndex / this.cols );
      // center item within cell
      var x = ( col + 0.5 ) * this.columnWidth - item.size.outerWidth / 2;
      var y = ( row + 0.5 ) * this.rowHeight - item.size.outerHeight / 2;
      this.itemIndex++;
      return { x: x, y: y };
    };

    CellsByRow.prototype._getContainerSize = function() {
      return {
        height: Math.ceil( this.itemIndex / this.cols ) * this.rowHeight
      };
    };

    return CellsByRow;

  }

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
        'isotope/js/layout-mode'
      ],
      cellsByRowDefinition );
  } else {
    // browser global
    cellsByRowDefinition(
      window.Isotope.LayoutMode
    );
  }

})( window );;/**/
