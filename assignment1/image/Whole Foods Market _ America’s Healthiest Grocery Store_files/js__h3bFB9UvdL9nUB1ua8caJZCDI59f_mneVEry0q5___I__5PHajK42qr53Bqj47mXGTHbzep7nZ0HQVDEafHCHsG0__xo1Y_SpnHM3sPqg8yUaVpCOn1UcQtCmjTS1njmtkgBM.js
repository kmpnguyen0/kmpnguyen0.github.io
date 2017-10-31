(function storeFooter($){
  'use strict';
  var sf = {
    wrapper: '#footer-user-store-selector',

    /**
     * @param string store
     *   store node id
     * @return string
     *   Display HTML for chosen store
     */
    buildInnerHtml: function(store) {
      var out = '',
          country = sf.getCountryName(store.location.country),
          link = '<a href="/stores/' + store.path + '">' + store.storename + '</a>',
          infolink = '<a href="/stores/' + store.path + '">' + Drupal.t('More info about this store') + '</a>',
          maplink = '<a href="/store-locations#/store/' + store.nid + '">' + Drupal.t('Map & Directions') + '</a>',
          address = store.location.street + '<br />' + store.location.city + ', ' 
            + store.location.stateabbr + ' ' + store.location.zip + '<br />' 
            + country;
      
      out += '<h4>' + Drupal.t('Your Store Is') + ' ' + link + '</h4>';
      out += '<address>' + address + '</address>';
      out += '<span class="phone">' + Drupal.t('Phone:') + ' ' + store.phone + '</span><br />';
      out += '<span class="hours">' + Drupal.t('Hours:') + ' ' + store.hours + '</span><br />';
      out += '<span class="links">' + infolink + ' | ' + maplink + '</span>';
      return out;
    },

    /**
     * Get country name from abbreviation.
     * @param string country
     *   Country abbreviation.
     * @return string
     *   Country name
     */
    getCountryName: function(country) {
      if (country == 'US') {
        return Drupal.t('United States');
      }
      else if (country == 'CA') {
        return Drupal.t('Canada');
      }
      else if (country == 'UK' || country == 'GB') {
        return Drupal.t('United Kingdom');
      }
    },

    /**
     * Kick off script
     */
    init: function() {
      var user_store = $.cookie('local_store');
      if (user_store) {
        Drupal.WholeFoods.getStoreInfo(user_store, sf.placeStoreInfo);
      }
    },

    /**
     * Place store info in footer.
     * @param object || string || number store
     *   Param can either be a store node id or object of store info.
     *   Object should be formatted like this:
     *   {
     *     storenid: { 
     *        key: value,
     *        ...
     *     }
     *   } 
     */
    placeStoreInfo: function(store) {
      var storeinfo = {},
          storeHTML = '';

      if (typeof store == 'object') {
        storeinfo = Drupal.WholeFoods.removeStoreNidKey(store);
        storeHTML = sf.buildInnerHtml(storeinfo);

        $(sf.wrapper).empty();
        $(sf.wrapper).append(storeHTML);
      }
      else if (typeof store == 'string' || typeof store == 'number') {
        Drupal.WholeFoods.getStoreInfo(store, sf.placeStoreInfo);
      }
    },
  };

  // Attach to Drupal behaviors.
  Drupal.behaviors.store_footer_store_locator = {
    attach: function() {
      $(sf.wrapper).once('footer-user-store-selector', function() {
        // Run the script.
        sf.init();
        // Provide API to switch store in footer to external scripts.
        Drupal.WholeFoods.changeStoreInFooter = sf.placeStoreInfo;
      });
    }
  };
})(jQuery);;/**/
