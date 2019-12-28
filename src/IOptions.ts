import IStrategy from "./IStrategy";

interface IOptions {
	cacheFirst: IStrategy;
	cacheOnly: IStrategy;
	networkFirst: IStrategy;
	networkOnly: IStrategy;
	staleWhileRevalidate: IStrategy;
	precachedRoutes: Array<String>;
}

export default IOptions;
