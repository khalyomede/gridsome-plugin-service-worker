import { registerRoute } from "workbox-routing";
import {
	NetworkOnly,
	NetworkFirst,
	CacheOnly,
	CacheFirst,
	StaleWhileRevalidate,
} from "workbox-strategies";
import { clientsClaim, skipWaiting } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";

clientsClaim();
skipWaiting();
