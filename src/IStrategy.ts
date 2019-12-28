interface IStrategy {
  routes: Array<string | RegExp>;
  cacheName: string;
}

export default IStrategy;
