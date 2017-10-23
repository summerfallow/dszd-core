import History from './history';

let TDAPP = window.TDAPP || {};
let pageShowQuery = {};
let clickQuery = {};
let isInt = false;
const TalkingData = {
  init(config = {}) {
    isInt = true;
    TDAPP = window.TDAPP || {};
    pageShowQuery = config.pageShowQuery;
    clickQuery = config.clickQuery;
  },
  click(name, label, query = {}) {
    if (!isInt) return;
    const data = Object.assign({}, query, clickQuery());
    TDAPP.onEvent && TDAPP.onEvent(name, label, data);
    // console.log('数据统计', TDAPP.onEvent, name, label, data);
  },
  pageShow(label, query = {}) {
    if (!isInt) return;
    const opener = History.getOpener();
    const data = Object.assign({}, query, pageShowQuery(), {
      上一个页面: opener.title,
      上一个页面地址: opener.url,
    });
    TDAPP.onEvent && TDAPP.onEvent('打开页面', label, data);
    // console.log('数据统计', '打开页面', TDAPP.onEvent, label, data);
  },
  pageHide() {}
};

export default TalkingData;
