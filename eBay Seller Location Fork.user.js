// ==UserScript==
// @name         eBay Seller Location Fork
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Displays the registration location of eBay sellers on search results and product pages.
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

  //HTTP request headers
  const reqhead = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Mobile Safari/537.36'
  }

  //Inserts location info element into page
  function insertLocInfo(target, info) {
    var data = JSON.parse(JSON.parse(info.responseText));
    if (target) {
      console.log("Inserting seller location...");
      var loc = document.createElement("div");
      loc.innerText = 'Registration ' + data.registrationSite.replace("HongKong", "Hong Kong");
      target.insertAdjacentElement('afterend', loc);
    }
  }

  //Search results:
  if (document.URL.includes("/sch/")) {

    //Saves all seller info rows to array
    var usrs = document.querySelectorAll('span[class="s-item__seller-info-text"]');

    //Iterates through sellers
    usrs.forEach(function(usr,i) {
      //Inserts delay to avoid IP blocking for excessive requests
      setTimeout(() => {
        //Checks if element is empty
        if (usr) {
          //Constructs seller info URL
          var dat = "https://" + window.location.hostname + "/itm/sellerInfoV2?sid=" + usr.innerText.split(" ")[0] + "&itemId=" + window.location.pathname.split("/").pop();
          console.log("Seller info url:" + dat);
          //Load info from URL
          GM_xmlhttpRequest({
            method: 'GET',
            url: dat,
            headers: reqhead,
            onload: function(response) {
              insertLocInfo(usr,response);
            }
          });
        } //if (usr)
      }, i * 500); //setTimeout
    }); //usrs.forEach

  //Item pages
  } else if (document.URL.includes("/itm/") ) {

    //Selects element with username
    var usr = document.querySelector('a[href*="/usr/"] span');
    if (!usr) {
      var usr = document.querySelector('a[href*="/str/"] span');
    }

    //Checks if element is empty
    if (usr) {
      //Constructs seller info URL
      var dat = "https://" + window.location.hostname + "/itm/sellerInfoV2?sid=" + usr.innerText + "&itemId=" + window.location.pathname.split("/").pop();
      //Load info from URL
      GM_xmlhttpRequest({
        method: 'GET',
        url: dat,
        headers: reqhead,
        onload: function(response) {
          //German eBay
          var section = document.querySelector(".ux-seller-section__content");
          if (section) {
            insertLocInfo(section,response);
          } else {
            //ebay.com
            var section_alt = document.querySelector(".x-sellercard-atf__info");
            if (section_alt) {
              insertLocInfo(section_alt,response);
            }
          }
        } //onload: function(response)
      }); //GM_xmlhttpRequest
    } //if (usr)
  }

})();
