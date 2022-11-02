// ==UserScript==
// @name         eBay Seller Location Fork
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Displays the current and registration location of eBay sellers on search results and product pages.
// @author       sonofevil, master131
// @match        https://www.ebay.*.*/sch/*
// @match        https://www.ebay.*/sch/*
// @match        https://www.ebay.*.*/itm/*
// @match        https://www.ebay.*/itm/*
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    function copyNodeStyle(sourceNode, targetNode) {
        const computedStyle = window.getComputedStyle(sourceNode);
        Array.from(computedStyle).forEach(key => targetNode.style.setProperty(key, computedStyle.getPropertyValue(key), computedStyle.getPropertyPriority(key)))
    }

  //Search results:

  if (document.URL.includes("/sch/")) {

    var usrs = document.querySelectorAll('span[class="s-item__seller-info-text"]');

    usrs.forEach(function(usr) {
      if (usr) {
          var dat = "https://" + window.location.hostname + "/itm/sellerInfoV2?sid=" + usr.innerText.split(" ")[1] + "&itemId=" + window.location.pathname.split("/").pop();
          GM_xmlhttpRequest({
              method: 'GET',
              url: dat,
              headers: {
                   'Accept': 'application/json, text/javascript, */*; q=0.01',
                   'X-Requested-With': 'XMLHttpRequest',
                   'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Mobile Safari/537.36'
              },
              onload: function(response) {
                  var data = JSON.parse(JSON.parse(response.responseText));
                  var si = usr; //document.querySelector(".s-item__seller-info");
                  if (si) {
                      var loc = document.createElement("div");
                      //copyNodeStyle(si, loc);
                      loc.innerText = 'Registration ' + data.registrationSite.replace("HongKong", "Hong Kong");
                      si.insertAdjacentElement('afterend', loc);
                  }
              }
          });
          fetch(usr.href).then(function(e) {
              return e.text();
          }).then(function(e) {
              var doc = new DOMParser().parseFromString(e, "text/html");
              var si = document.querySelector(".ux-seller-section__content");
              if (si) {
                  var loc = document.createElement("div");
                  //copyNodeStyle(si, loc);
                  loc.innerText = 'Seller Location: ' + doc.querySelector('.mem_loc').innerText;
                  si.insertAdjacentElement('afterend', loc);
              }
         });
      }
    });
  }

  //Item pages:

  if (document.URL.includes("/itm/") ) {

    var usr = document.querySelector('a[href*="/usr/"]');

    if (usr) {
        var dat = "https://" + window.location.hostname + "/itm/sellerInfoV2?sid=" + usr.innerText + "&itemId=" + window.location.pathname.split("/").pop();
        GM_xmlhttpRequest({
            method: 'GET',
            url: dat,
            headers: {
                 'Accept': 'application/json, text/javascript, */*; q=0.01',
                 'X-Requested-With': 'XMLHttpRequest',
                 'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Mobile Safari/537.36'
            },
            onload: function(response) {
                var data = JSON.parse(JSON.parse(response.responseText));
                var si = document.querySelector(".ux-seller-section__content");
                if (si) {
                    var loc = document.createElement("div");
                    copyNodeStyle(si, loc);
                    loc.innerText = 'Registration ' + data.registrationSite.replace("HongKong", "Hong Kong");
                    si.insertAdjacentElement('afterend', loc);
                }
            }
        });
        fetch(usr.href).then(function(e) {
            return e.text();
        }).then(function(e) {
            var doc = new DOMParser().parseFromString(e, "text/html");
            var si = document.querySelector(".ux-seller-section__content");
            if (si) {
                var loc = document.createElement("div");
                copyNodeStyle(si, loc);
                loc.innerText = 'Seller Location: ' + doc.querySelector('.mem_loc').innerText;
                si.insertAdjacentElement('afterend', loc);
            }
       });
    }
  }

})();