# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

-   Bug when installing the library from NPM, and building a project after configuring this library would make the plugin to request missing files. The missing files have been added.

## [0.1.0] 2019-12-28

### Added

-   First working version. You can configure this plugin to fetch your route using these network strategies: - Cache-first (behind the `cacheFirst` option) - Cache-only (behind the `cacheOnly` option) - Network-first (behind the `networkFirst` option) - Network-only (behind the `networkOnly` option) - Stale while revalidate (behind the `staleWhileRevalidate` option)
-   You can add routes to precache ahead of time (right after the service worker installed) using the `precachedRoutes` option.
