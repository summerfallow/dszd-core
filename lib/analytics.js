import History from './history';

let dplus = null;
let zhuge = null;
let baidu = null;

const Analytics = {
  init: (id, register, cb) => {
    Analytics.dPlus.init(id, register, cb);
    Analytics.zhuge.init();
    Analytics.baidu.init();
  },
  track: (name, opt, callback) => {
    Analytics.dPlus.track(name, opt, callback);
    Analytics.zhuge.track(name, opt, callback);
    Analytics.baidu.track(name, opt);
  },
  baidu: {
    init: () => {
      const name = '_hmt';
      baidu = window[name];
      if (!baidu) return;
      baidu.push(['_setAutoPageview', false]);
    },
    track: (name, opt) => {
      if (!baidu) return;
      if (name === 'pageShow') {
        const current = History.getCurrent();
        baidu.push(['_trackPageview', current.url]);
        baidu.push(['_trackEvent', name, 'pageShow', opt.pageName]);
      } else {
        baidu.push(['_trackEvent', name, 'click', opt]);
      }
    }
  },
  zhuge: {
    init: () => {
      zhuge = window.zhuge;
    },
    track: (name, opt, callback) => {
      if (!zhuge) return;
      zhuge.track(name, opt, callback);
    },
  },
  dPlus: {
    init: (id, register, cb) => {
      dplus = window.dplus;
      if (!dplus) return;
      dplus.init(id, {
        disable_cookie: true,
        cross_subdomain_cookie: true,
        loaded: () => {
          dplus.register(register);
          cb && cb();
        }
      });
    },
    track: (name, opt, callback) => {
      if (!dplus) return;
      dplus.track(name, opt, callback);
    }
  }
};

export default Analytics;
