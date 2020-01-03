# gridsome-plugin-service-worker

Registers a service worker and apply your file strategies to let you build a PWA.

[![npm](https://img.shields.io/npm/v/gridsome-plugin-service-worker)](https://www.npmjs.com/package/gridsome-plugin-manifest) [![npm peer dependency version](https://img.shields.io/npm/dependency-version/gridsome-plugin-service-worker/peer/gridsome)](https://www.npmjs.com/package/gridsome) [![NPM](https://img.shields.io/npm/l/gridsome-plugin-service-worker)](https://github.com/khalyomede/gridsome-plugin-service-worker/blob/master/LICENSE) [![Build Status](https://travis-ci.com/khalyomede/gridsome-plugin-service-worker.svg?branch=master)](https://travis-ci.com/khalyomede/gridsome-plugin-service-worker) [![codecov](https://codecov.io/gh/khalyomede/gridsome-plugin-service-worker/branch/master/graph/badge.svg)](https://codecov.io/gh/khalyomede/gridsome-plugin-service-worker) ![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/gridsome-plugin-service-worker) ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/gridsome-plugin-service-worker) [![Maintainability](https://api.codeclimate.com/v1/badges/fcef734413cc4eca1f82/maintainability)](https://codeclimate.com/github/khalyomede/gridsome-plugin-service-worker/maintainability)

## Summary

-   [About](#about)
-   [Features](#features)
-   [Requirements](#requirements)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Changelog](CHANGELOG.md)
-   [API](#api)
-   [Run the tests](#run-the-tests)

## About

I created this plugin because I needed a flexible way to add a service worker into my web app, and without having all the unpleasing setup (importing the library, registering my service worker, adding the files to the head, ...).

I wanted to have a drop-in way to tell which routes to capture and for each, to decide which specific network strategy.

## Features

-   Generates the script that registers your service worker and the script that defines the service worker
-   Adds the necessary scripts to the head of each of your HTML files at build time
-   Let you choose how your routes should be fetched on the network among
    -   Network-first
    -   Network-only
    -   Cache-first
    -   Cache-only
    -   Stale while revalidate
-   Let you choose which route to cache ahead, a.k.a. precaching (very powerful with Cache-only)

## Requirements

-   NPM or Yarn installed on your machine

## Installation

With NPM

```bash
npm install --save-dev gridsome-plugin-service-worker
```

With Yarn

```bash
yarn add --dev gridsome-plugin-service-worker
```

## Usage

This section assumes you already installed Gridsome.

Add the plugin to the list of your plugins in the file `gridsome.config.js`

```javascript
module.exports = {
	siteName: "Gridsome",
	plugins: [
		{
			use: "gridsome-plugin-service-worker",
		},
	],
};
```

Add a first network strategy, which will serve as an example that you will be able to tweak later.

```javascript
module.exports = {
	siteName: "Gridsome",
	plugins: [
		{
			use: "gridsome-plugin-service-worker",
			options: {
				networkFirst: {
					routes: [
						"/",
						/\.(js|css|png)$/, // means "every JS, CSS, and PNG images"
					],
				},
			},
		},
	],
};
```

Run this command to build your project.

With NPM

```bash
npm run build
```

With Yarn

```bash
yarn build
```

Serve the files locally, and navigate to the home page. Simulate a connection shutdown by going in the Chrome DevTools panel, in the "Network" tab, then choose "Offline" in the dropdown.

Reload your page: you should still see your home page, which means the service worker successfully fetched your resources from the cache as a fallback.

Whenever you use your `CacheFirst` (for example), but you still need your files to be fetched again because you made a change on these files, you should change the name of the cache (using the `cacheName` option in `gridsome.config.js`) in order for the service worker to "update" the cache.

Lastly (optional), configure your server (if your server architecture allow you to do so) to prevent the files `/service-worker.js` and `/assets/js/service-worker.js` to be cached by your server. Here is an example using Apache:

```htaccess
<Files /service-worker.js>
  FileETag None
  <ifModule mod_headers.c>
     Header unset ETag
     Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
     Header set Pragma "no-cache"
     Header set Expires "Wed, 11 Jan 1984 05:00:00 GMT"
  </ifModule>
</Files>

<Files /assets/js/service-worker.js>
  FileETag None
  <ifModule mod_headers.c>
     Header unset ETag
     Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
     Header set Pragma "no-cache"
     Header set Expires "Wed, 11 Jan 1984 05:00:00 GMT"
  </ifModule>
</Files>
```

The [browsers now are configured to check every 24h at most for service worker changes](https://stackoverflow.com/questions/38843970/service-worker-javascript-update-frequency-every-24-hours/38854905#38854905), but this operations make sure the browser will not try to cache these files anyway.

## API

_You will find the prototype of the `Strategy` type below._

-   options
    -   **cacheFirst**: `Strategy`: Every time the browser requests these routes, if it is in the browser's cache, it will be used instead of fetching it from the network (even if the network is up). If it is not in the network, fetches it from the network, plus add it on the browser's cache. Used for low-priority resources that do not change often, or do not need to display an up-to-date response, like pictures. [Workbox's Cache-first documentation](https://developers.google.com/web/tools/workbox/modules/workbox-strategies#cache_first_cache_falling_back_to_network)
    -   **cacheOnly**: `Strategy` Every time the browser requests these routes, if they are in the browser's cache, they will be fetched from the cache. If they are not in the cache, they will return no response. Note that this strategy works very well when you precache files using the `precachedRoutes` options. [Workbox's Cache-only documentation](https://developers.google.com/web/tools/workbox/modules/workbox-strategies#cache_only)
    -   **networkFirst**: `Strategy`: Every time the browser requests these routes, they will be cached in the browser's cache. If the network is down, tries to fetch the request from the cache (if the resource have been cached). Used when you always need to present the most up-to-date resources to the user, and you also want to be able to display offline content as a fallback. [Workbox's Network-first documentation](https://developers.google.com/web/tools/workbox/modules/workbox-strategies#network_first_network_falling_back_to_cache)
    -   **networkOnly**: `Strategy`: This corresponds to the default behavior, like if you would not have used any strategy for your routes. [Workbox's Network-only documentation](https://developers.google.com/web/tools/workbox/modules/workbox-strategies#network_only)
    -   **precachedRoutes**: `Array<String>` A list of routes to cache ahead (right after the service worker is installed). This is very powerful to use with the `cacheOnly` option since you will be able to create Offline-ready apps without the user to browser the desired resources to cache. [Workbox's precaching documentation](https://developers.google.com/web/tools/workbox/modules/workbox-precaching#what_is_precaching)
    -   **staleWhileRevalidate**: `Strategy` Every time the browser requests these routes, if they are in the cache, they are returned from the cache to the browser, plus the service worker will still try to fetch the response from the network in the background and put this response in the cache. Used when the resource needs to be served the fastest possible, and when it is not a problem if the resource is not up-to-date when requested, like fonts, videos, static pages that do not display critical content, ... [Workbox's Stale while revalidate documentation](https://developers.google.com/web/tools/workbox/modules/workbox-strategies#stale-while-revalidate)

```typescript
interface Strategy {
	cacheName: string;
	routes: Array<String | RegExp>;
}
```

## Run the tests

1. Clone the project: `git clone https://github.com/khalyomede/gridsome-plugin-service-worker.git`
2. Install the dependencies

    - With NPM: `npm install`
    - With Yarn: `yarn install`

3. Run the tests
    - With NPM: `npm run test`
    - With Yarn: `yarn test`
