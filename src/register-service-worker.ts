import { Workbox } from "workbox-window";

if ("serviceWorker" in navigator) {
	const workbox = new Workbox("/service-worker.js");

	(async () => await workbox.register())();
}
