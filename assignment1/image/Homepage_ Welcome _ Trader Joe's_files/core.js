var body, debugging, trader,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

body = jQuery('body');

debugging = false;

trader = {
  detect: {
    isTouchDevice: function() {
      return __indexOf.call(window, 'ontouchstart') >= 0 || __indexOf.call(window, 'onmsgesturechange') >= 0;
    },
    isMobile: function() {
      var _ref;
      return (_ref = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) || window.innerWidth < 767) != null ? _ref : {
        "true": false
      };
    },
    placeholderIsSupported: function() {
      return document.createElement("input").placeholder !== void 0;
    }
  },
  createBorders: function() {
    var imgbrd;
    imgbrd = body.find('.border-image');
    if (imgbrd.length > 0) {
      return imgbrd.each(function() {
        var curimg, side, sides, sideshtml, _i, _len;
        curimg = jQuery(this);
        curimg.addClass('image-border-detected');
        sides = ['top', 'right', 'bottom', 'left'];
        sideshtml = "";
        for (_i = 0, _len = sides.length; _i < _len; _i++) {
          side = sides[_i];
          sideshtml += '<div class="border-side border-' + side + '"><div class="border"></div></div>';
        }
        curimg.prepend(sideshtml);
        return true;
      });
    }
  },
  createInputBorders: function() {
    var imgbrd;
    imgbrd = jQuery('input[type="text"].zipcode,input[type="text"].form-control,input[type="password"].form-control,textarea.form-control,.form-control').not('select');
    if (imgbrd.length > 0) {
      return imgbrd.each(function() {
        var curinput, newinputcontainer, side, sides, sideshtml, _i, _len;
        curinput = jQuery(this);
        curinput.addClass('input-border-detected').removeClass('form-control');
        newinputcontainer = jQuery('<div class="input-border-container" />');
        sides = ['top', 'right', 'bottom', 'left'];
        sideshtml = "";
        for (_i = 0, _len = sides.length; _i < _len; _i++) {
          side = sides[_i];
          sideshtml += '<div class="input-border input-border-side-' + side + '"></div>';
        }
        newinputcontainer.append(sideshtml).addClass(curinput.attr('class'));
        curinput.before(newinputcontainer);
        newinputcontainer.append(curinput);
        return true;
      });
    }
  },
  homeSlider: function() {
    if (body.find('.slider').length > 0) {
      jQuery('.slider').tradejoesSlider({
        mode: 'carousel',
        maxVisible: 3,
        slideEasing: 'easeInOutQuart',
        nextNav: '<span class="alt-arrow">Next</span>',
        prevNav: '<span class="alt-arrow">Next</span>',
        itemHeight: 330,
        fitDuration: 1,
        fitDelay: 1,
        swipePage: true,
        slideDuration: 500
      });
    }
    return true;
  },
  bindPlaceholder: function() {
    if (!this.detect.placeholderIsSupported()) {
      jQuery('input[placeholder]').each(function() {
        var curitem, curplaceholder;
        curitem = jQuery(this);
        curplaceholder = curitem.attr('placeholder');
        curitem.addClass('has-placeholder').attr('placeholder', '').attr('data-placeholder', curplaceholder);
        if (curitem.val() === '') {
          curitem.val(curplaceholder);
        }
        curitem.on('focus', function() {
          var dataplaceholder;
          dataplaceholder = jQuery(this).attr('data-placeholder');
          if (jQuery(this).val() === dataplaceholder) {
            jQuery(this).val('');
          }
          return true;
        }).on('blur', function() {
          var dataplaceholder;
          dataplaceholder = jQuery(this).attr('data-placeholder');
          if (jQuery(this).val() === '') {
            jQuery(this).val(dataplaceholder);
          }
          return true;
        });
        return true;
      });
    }
    return true;
  },
  bindZipCodeFinder: function() {
    var form, zipcode;
    form = jQuery('#zipcodefinder');
    zipcode = form.find('input[type="text"].zipcode');
    zipcode.on('focus keyup', function() {
      return zipcode.parent().removeClass('zip-error');
    });
    form.on('submit', function(e) {
      if (zipcode.length > 0 && /^\d{5}$/.test(zipcode.val())) {
        form.find('span.zip-error').replaceWith('<span class="label-error zip-error"></span>');
        zipcode.removeClass('has-error');
      } else {
        zipcode.addClass('has-error');
        zipcode.focus().parent().addClass('zip-error');
        form.find('span.zip-error').replaceWith('<span class="label-error zip-error">Enter your five-digit zip code.</span>');
        console.log('Invalid zipcode');
        e.preventDefault();
        e.stopPropagation();
      }
      return true;
    });
    return true;
  },
  collapseMenu: function() {
    jQuery('.bs-navbar-finder-collapse').on('show.bs.collapse', function() {
      if (!jQuery('.menu-toggle').hasClass('collapsed')) {
        jQuery('.bs-navbar-collapse').collapse('hide');
        jQuery('.menu-toggle').addClass('collapsed');
      }
      return true;
    });
    jQuery('.bs-navbar-collapse').on('show.bs.collapse', function() {
      if (!jQuery('.finder-toggle').hasClass('collapsed')) {
        jQuery('.bs-navbar-finder-collapse').collapse('hide');
        jQuery('.finder-toggle').addClass('collapsed');
      }
      return true;
    });
    jQuery('#menu .navbar-collapse').prepend('<div class="line visible-xs"></div>');
    jQuery('#menu li').each(function(a, b) {
      if (b > 0 || a > 0) {
        return jQuery(this).before('<li class="line visible-xs"></li>');
      }
    });
    return true;
  },
  arrowIcons: function() {
    if (jQuery('.more-link').length > 0) {
      jQuery('.more-link').each(function() {
        var arrowicon, curlink, curtext;
        curlink = jQuery(this);
        if (curlink.find('.icon.arrow').length > 0 || curlink.hasClass('nojs')) {
          return true;
        } else {
          curtext = encodeURI(curlink.html());
          arrowicon = '<span class="icon arrow"></span>';
          if (curtext.indexOf('%C2%BB') > -1 || curtext.indexOf('&raquo') > -1) {
            curtext = curtext.replace(/%C2%BB/g, arrowicon).replace(/&raquo;/g, arrowicon).replace(/&raquo/g, arrowicon);
            curtext = decodeURI(curtext);
            true;
          } else {
            curtext = decodeURI(curtext + arrowicon);
          }
          return curlink.html(curtext);
        }
      });
    }
    if (jQuery('.btn').length > 0) {
      return jQuery('.btn').each(function() {
        var arrowicon, curlink, curtext;
        curlink = jQuery(this);
        if (curlink.find('.icon.arrow').length > 0 || curlink.hasClass('nojs')) {
          return true;
        } else {
          curtext = encodeURI(curlink.html());
          arrowicon = '<span class="icon arrow-inverted"></span>';
          if (curtext.indexOf('%C2%BB') > -1 || curtext.indexOf('&raquo') > -1) {
            curtext = curtext.replace(/%C2%BB/g, arrowicon).replace(/&raquo;/g, arrowicon).replace(/&raquo/g, arrowicon);
            curtext = decodeURI(curtext);
            true;
          } else {
            curtext = decodeURI(curtext + arrowicon);
          }
          return curlink.html(curtext);
        }
      });
    }
  },
  accordion: function() {
    if (jQuery('.accordion').length > 0) {
      jQuery('.accordion').each(function() {
        var curacor;
        curacor = jQuery(this);
        if (!curacor.hasClass('brand-blue')) {
          return curacor.find('.panel').not(':first').each(function() {
            return jQuery(this).before('<div class="line"></div>');
          });
        }
      });
      return jQuery('.accordion.brand-blue').each(function() {
        var curacor;
        curacor = jQuery(this);
        return curacor.find('.panel').each(function() {
          return jQuery(this).find('.panel-body').after('<div class="line"></div>');
        });
      });
    }
  },
  dropdown: function() {
    var newlist, newtitle, sidebarmenu, sidebarnum;
    if (jQuery('.chosen-input').length > 0) {
      jQuery('.chosen-input').each(function() {
        var cg, curinput, nw, _ref, _ref1, _ref2;
        curinput = jQuery(this);
        if (curinput.hasClass('fixedwidth')) {
          cg = (_ref = curinput.closest('.column-game').hasClass('double-cutter')) != null ? _ref : {
            64: (_ref1 = curinput.closest('.column-game').hasClass('this-cutter')) != null ? _ref1 : {
              14: (_ref2 = curinput.closest('.column-game').hasClass('mid-cutter')) != null ? _ref2 : {
                50: 30
              }
            }
          };
          nw = curinput.width();
          nw = nw + cg + 'px';
          return curinput.chosen({
            disable_search_threshold: 1000,
            width: nw
          });
        } else if (curinput.hasClass('fluid')) {
          return curinput.chosen({
            disable_search_threshold: 1000,
            width: '100%'
          });
        } else if (curinput.hasClass('staticwidth')) {
          nw = curinput.width() + 60 + 'px';
          return curinput.chosen({
            disable_search_threshold: 1000,
            width: nw
          });
        } else {
          return curinput.chosen({
            disable_search_threshold: 1000
          });
        }
      });
    }
    if (jQuery('.sidebar-section').length > 0) {
      sidebarmenu = jQuery('<div class="dropdown sidebar-menu visible-xs" />');
      sidebarnum = 0;
      if (jQuery('.sidebar-section').find('.list').length > 1) {
        sidebarnum = sidebarnum + 1;
      }
      if (sidebarnum > 0) {
        sidebarmenu.append('<button class="btn btn-brand dropdown-toggle nojs btn-block btn-collapse" type="button" id="sidebarmenu" data-toggle="dropdown"><span>Menu</span><div><div class="input-border input-border-side-left"></div><b></b></div></button>');
      } else {
        newtitle = jQuery('.sidebar-section.sectioned').first().find('h3').first().text();
        sidebarmenu.append('<button class="btn btn-brand dropdown-toggle nojs btn-block btn-collapse" type="button" id="sidebarmenu" data-toggle="dropdown"><span>' + newtitle + '</span><div><div class="input-border input-border-side-left"></div><b></b></div></button>');
      }
      newlist = jQuery('<ul class="dropdown-menu" role="menu" aria-labelledby="sidebarmenu" />');
      jQuery('.sidebar-section').each(function() {
        var cursection;
        cursection = jQuery(this);
        if (jQuery('.sidebar-section').find('h3').length > 1 && (jQuery('.sidebar-section').find('.list').length > 1 || jQuery('.sidebar-section').find('ul').not('.bullet-list').length > 1) && (cursection.find('.list').length > 0)) {
          newlist.append('<li class="line"></li><li><h3 class="subheader2">' + cursection.find('h3').first().text() + '</h3></li>');
          cursection.addClass('hidden-xs').after('<div class="clearfix visible-xs"></div>');
          cursection.prev('.line').addClass('hidden-xs');
        }
        if (cursection.find('.list').length > 0) {
          return cursection.find('.list').find('li').not('.line').each(function() {
            var curitem, newline;
            curitem = jQuery(this).clone();
            newline = jQuery('<li class="line" />');
            newlist.append(newline);
            return newlist.append(curitem);
          });
        }
      });
      sidebarmenu.append(newlist);
      if (jQuery('.sidebar-section.sectioned').first().prev('.line').length > 0) {
        jQuery('.sidebar-section.sectioned').first().prev('.line').addClass('hidden-xs').after(sidebarmenu);
      } else {
        jQuery('.sidebar-section.sectioned').first().before(sidebarmenu);
      }
    }
    jQuery('.navbar-collapse').css({
      height: 'auto'
    });
  },
  tabs: function() {
    if (jQuery('[role="tablist"]').length > 0) {
      return jQuery('[role="tablist"]').each(function() {
        var curtabs;
        curtabs = jQuery(this);
        return curtabs.on('click', 'li a', function(e) {
          var curlink;
          e.preventDefault();
          e.stopPropagation();
          curlink = jQuery(this);
          curlink.parent().addClass('active').siblings().removeClass('active');
          return curtabs.next('.tab-container').find('.tab-content' + curlink.attr('href') + '').show().siblings('.tab-content').hide();
        });
      });
    }
  },
  pageheader: function() {
    var breadcrumb, breadcrumbclone, header, menu, menudivider, newcontainer;
    if (jQuery('.page-header').length > 0) {
      header = jQuery('.page-header');
      breadcrumb = header.find('.breadcrumb');
      breadcrumb.remove();
      breadcrumbclone = breadcrumb.clone();
      newcontainer = jQuery('<div class="container" />');
      newcontainer.append(breadcrumbclone);
      header.find('.container').addClass('page-header-container').after(newcontainer);
      menu = jQuery('#menu');
      menudivider = menu.find('.divider');
      menudivider.closest('.container').after(menudivider.clone().addClass('visible-xs visible-sm'));
      return menudivider.addClass('hidden-xs hidden-sm');
    }
  },
  adjustAddThisButtons: function(lcount) {
    if ((0 === $(".addthis_responsive_sharing").children().length) && (lcount < 100)) {
      return setTimeout(trader.adjustAddThisButtons, 100, lcount + 1);
    } else {
      console.log("Addthis Loaded");
      $(".addthis_responsive_sharing").find("a").attr("href", "");
      return $(".addthis_responsive_sharing").find("svg").removeAttr("title");
    }
  },
  cols: function() {
    var maxheight, maxpheight, p_offset_max;
    maxheight = 0;
    maxpheight = 0;
    p_offset_max = 0;
    if (jQuery('.display-table').length > 0) {
      return jQuery('.display-table').each(function() {
        var caption, caption_offset, caption_offset_max, cheight, col, cols, currow, diff, img, img_height, imgs, imgs_in_loop, new_offset, p_offset, para_in_loop, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o;
        currow = jQuery(this);
        cols = currow.find('[class*="col"]');
        for (_i = 0, _len = cols.length; _i < _len; _i++) {
          col = cols[_i];
          jQuery(col).css({
            height: 'auto',
            marginBottom: 'auto'
          });
          cheight = jQuery(col).height();
          if (cheight > maxheight) {
            maxheight = cheight;
          }
          if (debugging) {
            console.log(col, maxheight);
          }
        }
        jQuery(cols).find('.lh-2').css({
          position: 'static',
          top: ' '
        });
        if (jQuery('.checkScript').hasClass('img_bottom_path')) {
          for (_j = 0, _len1 = cols.length; _j < _len1; _j++) {
            col = cols[_j];
            para_in_loop = jQuery(col).find('.lh-2');
            p_offset = para_in_loop.position().top;
            if (p_offset > p_offset_max) {
              p_offset_max = p_offset;
            }
          }
          for (_k = 0, _len2 = cols.length; _k < _len2; _k++) {
            col = cols[_k];
            para_in_loop = jQuery(col).find('.lh-2');
            if (para_in_loop.position().top < p_offset_max) {
              new_offset = p_offset_max - para_in_loop.position().top;
              para_in_loop.css({
                position: 'relative',
                top: new_offset
              });
            } else {
              if (debugging) {
                console.log(para_in_loop.position().top);
              }
            }
          }
          imgs = jQuery('.pushImg');
          for (_l = 0, _len3 = imgs.length; _l < _len3; _l++) {
            img = imgs[_l];
            imgs_in_loop = jQuery(img);
            img_height = jQuery(img).height();
            diff = para_in_loop.position().top - img_height;
            imgs_in_loop.css({
              position: 'relative',
              top: diff - 20
            });
          }
        }
        if (jQuery('.display-table').hasClass('palate')) {
          jQuery(cols).find('.link2').css({
            position: 'static',
            top: ' '
          });
          caption_offset_max = 0;
          for (_m = 0, _len4 = cols.length; _m < _len4; _m++) {
            col = cols[_m];
            caption = jQuery(col).find('.link2');
            caption_offset = caption.position().top;
            if (caption_offset > caption_offset_max) {
              caption_offset_max = caption_offset;
            }
            for (_n = 0, _len5 = cols.length; _n < _len5; _n++) {
              col = cols[_n];
              caption = jQuery(col).find('.link2');
              if (caption.position().top < caption_offset_max) {
                new_offset = caption_offset_max - caption.position().top;
                caption.css({
                  position: 'relative',
                  top: new_offset
                });
              } else if (debugging) {
                console.log(caption.position().top);
              }
            }
            imgs = jQuery('.pushImg');
            for (_o = 0, _len6 = imgs.length; _o < _len6; _o++) {
              img = imgs[_o];
              imgs_in_loop = jQuery(img);
              img_height = jQuery(img).height();
              diff = caption.position().top - img_height;
              imgs_in_loop.css({
                position: 'relative',
                top: diff - 50
              });
            }
          }
        }
        return cols.css({
          height: maxheight,
          marginBottom: '5px',
          marginTop: '10px'
        });
      });
    }
  },
  scrollbars: {
    init: function() {
      if (jQuery('.scrollable').length > 0) {
        return jQuery(".scrollable").mCustomScrollbar({
          theme: "dark-thin"
        });
      }
    },
    update: function() {
      if (jQuery('.scrollable').length > 0) {
        return jQuery('.scrollable').mCustomScrollbar('update');
      }
    }
  },
  init: function() {
    this.createBorders();
    this.createInputBorders();
    this.homeSlider();
    this.bindPlaceholder();
    this.bindZipCodeFinder();
    this.collapseMenu();
    this.arrowIcons();
    this.accordion();
    this.dropdown();
    this.tabs();
    this.pageheader();
    this.adjustAddThisButtons(0);
    return true;
  }
};

window.onload = function() {
  trader.cols();
};

jQuery(document).on('ready', function() {
  var uagent;
  trader.init();
  $(window).on('resize', function() {
    return trader.cols();
  });
  uagent = navigator.userAgent;
  if (uagent.indexOf('rv:11') > -1 || (uagent.indexOf('MSIE') > -1 && uagent.indexOf('10') > -1)) {
    jQuery('html').addClass('ie modern-ie');
  }
  document.documentElement.setAttribute('data-useragent', uagent);
  if (jQuery('.article').hasClass('fourOfour')) {
    jQuery('.main-page').css('width', '100%');
  }
  return true;
});

window.trader = trader;

//# sourceMappingURL=core.map