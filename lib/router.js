import { hashHistory } from 'react-router';
import Device from './device';
import History from './history';
import Utils from './utils';

const Router = {
  hashHistory,
  goBack() {
    if (Device.isPlus()) {
      Device.webView.close();
    } else {
      hashHistory.goBack();
    }
  },
  push(url, isOpen = true, query, onClose, onLoad, extras) {
    if (Device.isPlus() && isOpen) {
      Device.webView.open(url, query, onClose, onLoad, extras);
    } else {
      const id = Utils.getUUID();
      if (isOpen) hashHistory.push(url);
      else hashHistory.replace(url);

      History.forward(id, url, false, query);
    }
  },
  toLaunch(url) {
    if (Device.isPlus()) Device.webView.toLaunch();
    else hashHistory.push(url);
  }
};

export default Router;
