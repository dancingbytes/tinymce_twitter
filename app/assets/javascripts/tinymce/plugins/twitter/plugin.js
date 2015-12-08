;(function($) {

  'use strict'

  var REQUEST_URL = '/admin/resources';
  var TWITTER_URL = 'https://api.twitter.com/1/statuses/oembed.json?url={url}';

  var FORM_TMPL = (

    '<div class="tinymce-twitter-window">' +

      '<div class="row">' +

        '<div class="col-md-12">' +

          '<div class="form-group">' +
            '<label>{utl_title}</label>' +
            '<input type="url" class="form-control tinymce-twitter-url" />' +
          '</div>' +

          '<div class="form-group">' +
            '<label>{preview_title}</label>' +
            '<div class="tinymce-twitter-preview" style="background-image:url(\'{bg}\')">&nbsp;</div>' +
          '</div>' +

        '</div>' +

      '</div>' +

    '</div>'

  ); // FORM_TMPL

  var TWEET_TMPL = (
    '<blockquote class="twitter-tweet tw-align-center">{tweet}</blockquote>'
  );

  function Tmpl(format, obj) {

    return format.replace(/{\w+}/g, function(p1, offset, s) {
      return obj[ p1.replace(/[{}]/g, '') ];
    });

  }; // Tmpl

  function TwitterCard(ed, url) {

    var loading,
        urlBefore,
        contentData;

    var inputEl,
        prevEl;

    function showDialog() {

      onReset();

      var win = ed.windowManager.open({

        title:  'Вставить твит',
        width:  520,
        height: 500,

        html:  Tmpl(FORM_TMPL, {
          utl_title:      'Введите ссылку на твит',
          preview_title:  'Предпросмотр',
          bg: url + '/img/twitter.svg'
        }),

        buttons: [
          {
            text:    'Вставить',
            onclick: insertTweet,
            subtype: 'primary'
          },
          {
            text:     ed.translate('Cancel'),
            onclick:  ed.windowManager.close
          }
        ]

      });

      // Выключаем обработку события submit со стороны редактора
      win.off('submit');

      inputEl = $(win.$el).find('input.tinymce-twitter-url');
      prevEl  = $(win.$el).find('div.tinymce-twitter-preview');

      inputEl.on('change', onLoadTweet);
      inputEl.on('keyup',  onLoadTweet);

    }; // showDialog

    function onComplete() {
      loading = false;
    }; // onComplete

    function onSuccess(resp, s, o) {

      if (resp && resp.html) {

        contentData = onPrepareData(resp.html);
        prevEl.html(contentData);

        setTimeout(function() {
          twttr && twttr.widgets.load();
        }, 150);

      } else {
        prevEl.html('<p class="bg-danger">Неверный ответ сервера</p>');
      }

    }; // onSuccess

    function onFailure() {
      prevEl.html('<p class="bg-danger">Ошибка обработки</p>');
    }; // onFailure

    function onLoadTweet(evt) {

      var url = Tmpl(TWITTER_URL, { url: inputEl.val() });

      if (loading || (urlBefore == url)) { return; }

      contentData = '';
      loading     = true;
      urlBefore   = url;

      prevEl.html('<p class="bg-info">Загрузка...</p>');

      $.ajax({

        url:          REQUEST_URL,
        type:         'POST',
        dataType:     'json',
        cache:        false,

        data: {
          authenticity_token: $('meta[name="csrf-token"]').attr( 'content' ),
          url: url
        },

        complete:     onComplete,
        success:      onSuccess,
        error:        onFailure,

        timeout:      60000

      }); // ajax

    }; // onLoadTweet

    function insertTweet() {

      if (String(contentData).length == 0) { return; }

      ed.execCommand('mceInsertContent', false, contentData + "<br />");
      ed.windowManager.close();

      onReset();

    }; // insertTweet

    function onPrepareData(data) {

      var el = $.parseHTML(data);
      if (el.length == 0) { return; }

      return Tmpl(TWEET_TMPL, {
        tweet: el[0].innerHTML
      });

    }; // onPrepareData

    function onReset() {

      loading     = false;
      urlBefore   = "";
      contentData = "";

    }; //  onReset

    //-------------------------------------------------------------------------
    ed.addButton('twitter', {
      tooltip:  'Вставить твит',
      image:    url + '/img/twitter.svg',
      onclick:  showDialog
    });

    ed.addMenuItem('twitter', {
      text:     'Вставить твит',
      image:    url + '/img/twitter.svg',
      context:  'insert',
      onclick:  showDialog
    });

  }; // TwitterCard

  tinymce.PluginManager.add('twitter', TwitterCard);

})(jQuery);
