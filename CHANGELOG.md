# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Bug when a dependency that was used to validate the option was generating an error when building the project on Netlify.

## [0.1.3] 2020-01-05

### Fixed

- Bug when new installations would see their service worker not working because the service worker registration file would not have been copied to the static folder.

## [0.1.2] 2020-01-03

### Fixed

- The service worker registration file was previously compiled each time you would build your project. Now it is compiled by default, and will be used compiled instead (which improved the speed of this plugin by aproximatively 25% in my computer).
- Previously, you could potentially catch the service worker registration file within one of your network strategies if you specified a regular expression to catch it (for example, using `/\.js$/` to catch all the Javascript files would also catch this service worker registration file). This could potentially be fatal if you used a cacheFirst strategy as this would mean this file could never change. Now, the generated service worker registration file (`/assets/js/service-worker.js`) will not be catched by any of your network strategies anymore.

## [0.1.1] 2019-12-28

### Fixed

- Bug when installing the library from NPM, and building a project after configuring this library would make the plugin to request missing files. The missing files have been added.

## [0.1.0] 2019-12-28

### Added

- First working version. You can configure this plugin to fetch your route using these network strategies: - Cache-first (behind the `cacheFirst` option) - Cache-only (behind the `cacheOnly` option) - Network-first (behind the `networkFirst` option) - Network-only (behind the `networkOnly` option) - Stale while revalidate (behind the `staleWhileRevalidate` option)
- You can add routes to precache ahead of time (right after the service worker installed) using the `precachedRoutes` option.
