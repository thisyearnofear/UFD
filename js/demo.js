/**
 * demo.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
{
  setTimeout(() => document.body.classList.add("render"), 30);
  const navdemos = document.querySelectorAll("nav.demos > .demo");
  Array.from(navdemos).forEach((link) =>
    link.addEventListener("click", (ev) => {
      ev.preventDefault();
      const href = ev.currentTarget.getAttribute("href");
      if (href) {
        document.body.classList.remove("render");
        setTimeout(() => {
          window.location.href = href;
        }, 100);
      }
    })
  );
}
