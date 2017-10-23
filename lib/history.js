import Device from './device';
import Utils from './utils';

const NAME = 'ZP_history';
const History = {
  // 初始化
  init(url) {
    Device.storage.setItem(NAME, null);

    if (!Device.isPlus()) {
      window.addEventListener('popstate', () => {
        const route = Device.storage.getItem(NAME) || [];
        const i = location.href.lastIndexOf('=') + 1;
        const key = location.href.substring(i);

        route.forEach((item, index) => {
          if (item.current) {
            const routeItem = route[index - 1] || {};

            if (routeItem.key === key) {
              console.log('浏览器返回');
              this.back();
            }
          }
        });
      }, false);

    }

    if (url) {
      this.forward(Utils.getUUID(), url);
    }

    // console.log('history init', null);
  },
  // 返回
  back() {
    const route = Device.storage.getItem(NAME) || [];
    route.pop();

    if (route.length) {
      route[route.length - 1].current = true;
    }

    // console.log('history back', route);
    Device.storage.setItem(NAME, route);
  },
  // 前进
  forward(id, url, replace = false, query = {}) {
    const route = Device.storage.getItem(NAME) || [];

    if (route.length) {
      route[route.length - 1].current = false;
    }

    route.push({
      id,
      url,
      replace,
      query,
      page: null, // 储存page组件的state
      close: null, // 储存子页面的数据
      current: true // 是否是当前显示页面
    });

    // console.log('history forward', route);

    Device.storage.setItem(NAME, route);
  },
  getCurrent() {
    let routeItem = {};
    const route = Device.storage.getItem(NAME) || [];

    route.forEach((item) => {
      if (item.current) {
        routeItem = item;
      }
    });

    // console.log('history getCurrent', routeItem);

    return routeItem;
  },
  getOpener() {
    let routeItem = {};
    const route = Device.storage.getItem(NAME) || [];

    route.forEach((item, index) => {
      if (item.current && index) {
        routeItem = route[index - 1];
      }
    });

    // console.log('history getOpener', routeItem);

    return routeItem;
  },
  // 设置历史记录
  setItem(item, name) {
    const route = Device.storage.getItem(NAME) || [];
    route.forEach((routeItem, index) => {
      if (item.id === routeItem.id) {
        if (name) {
          route[index][name] = item[name];
        } else {
          route[index] = item;
        }
      }
    });

    // console.log('history setItem', item, route);
    Device.storage.setItem(NAME, route);
  },
  // 跳转
  go() {},
  getList() {
    const route = Device.storage.getItem(NAME) || [];
    return route;
  }
};

export default History;
