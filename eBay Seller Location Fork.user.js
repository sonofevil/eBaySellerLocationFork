// ==UserScript==
// @name         eBay Seller Location Fork
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Displays the registration location of eBay sellers on search results and product pages.
// @icon         https://raw.githubusercontent.com/sonofevil/eBaySellerLocationFork/main/ebaysellerlocationicon64.png
// @author       sonofevil, master131
// @license      MIT
// @match        https://www.ebay.*.*/sch/*
// @match        https://www.ebay.*/sch/*
// @match        https://www.ebay.*.*/itm/*
// @match        https://www.ebay.*/itm/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @noframes
// ==/UserScript==

(async function() {
  'use strict';

  //HTTP request headers
  const reqhead = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0',
    'Cookie': document.cookie,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site':	'same-origin',
    'Sec-Fetch-User':	'?1',
    'TE':	'trailers',
    'Upgrade-Insecure-Requests': 1
  }

  // DOM element selectors. First thing to debug when the script stops working.
  const selSrchRes = {
    entry: 'div.s-item__info',
    link: 'a.s-item__link',
    info: 'span.s-item__seller-info'
  }
  const selItmPage = {
    loc: '[class$="nameAndAddress"] [class$="content"] [class$="item"]:last-child',
    usrlnk: '.d-stores-info-categories__container__info__section__title a.ux-action[href]',
    info: 'div.ux-seller-section, div.x-sellercard-atf__info',
  }
  const selSlrPage_loc = 'section.str-about-description__seller-info > span:first-of-type > span.str-text-span.BOLD';

  //Inserts location info element into page
  function insertLocInfo(target, location) {
    //var data = JSON.parse(JSON.parse(info.responseText));
    if (target) {
      console.log("Inserting seller location...");
      var loc = document.createElement("div");
      loc.innerText = 'Location: ' + location.replace("HongKong", "Hong Kong");
      target.insertAdjacentElement('afterend', loc);
    }
  }

  async function getUrlDocument(url) {
    return await fetch(url, { headers: reqhead })
      .then(response => response.text())
      .then(html => {
        var parser  = new DOMParser ();
        var redoc   = parser.parseFromString(html, "text/html");
        return redoc;
    })
      .catch(error => {
      console.log('Error: Failure to fetch page.');
    });
  }

  async function getDocLoc(itemDoc) {
    if (await itemDoc !== undefined) {
      // Seek location on /itm/ page
      var locElem = await itemDoc.querySelector(selItmPage.loc);
      if (await locElem !== null) {
        console.log("Location found on item page.")
        // Return location string if found on /itm/ page
        return locElem.innerText;
      } else {
        console.log("Location not found on item page, checking seller info page...")
        // Get seller's user link
        var slrLnk = await itemDoc.querySelector(selItmPage.usrlnk);
        if (await slrLnk !== null) {
          console.log("Seller info URL: " + slrLnk.href + '&_tab=1')
          // Get doc from user info URL
          var infoDoc = await getUrlDocument(slrLnk.href + '&_tab=1');
          console.log(infoDoc);
          // Return location string
          if (await infoDoc !== null) {
            return await infoDoc.querySelector(selSlrPage_loc).innerText;
          } else {
            console.log("Failure in loading page...")
            return " ";
          }
        } else {
          console.log("Couldn't find location.");
          return " ";
        }
      }
    } else {
      console.log("Couldn't find location.");
      return " ";
    }
  }

  async function getUrlLoc(itmUrl) {
    // Get doc from /itm/ URL
    var doc = await getUrlDocument(itmUrl);
    return getDocLoc(doc);
  }

  async function searchResults () {
    //Saves all item links to array
    const srcResults = await document.querySelectorAll(selSrchRes.entry);
    for (const result of srcResults) {
      if (result) {
        var itemLink = result.querySelector(selSrchRes.link);
        var sellInfo = result.querySelector(selSrchRes.info)
        console.log("Checking search result for seller location: " + itemLink.href)
        var itmDoc = await getUrlDocument(itemLink.href);
        await insertLocInfo(sellInfo, await getDocLoc(itmDoc));
      }
    }
  }

  //Search results:
  if (document.URL.includes("/sch/")) {
    searchResults();
  //Item pages
  } else if (document.URL.includes("/itm/")) {
    //Selects element with username
    var infoSection = document.querySelector(selItmPage.info);
    insertLocInfo(infoSection, await getDocLoc(document));
  }

})();
