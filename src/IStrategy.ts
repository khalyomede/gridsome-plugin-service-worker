interface IStrategy {
	routes: Array<string | RegExp>;
	cacheName: string;
	fileTypes: Array<RequestDestination>;
}

export default IStrategy;
