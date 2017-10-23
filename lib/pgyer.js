import Device from './device';
import Utils from './utils';

const $ = window.jQuery;

export default {
  appKey: '',
  apiKey: '',
  iosAppId: '',
  androidAppId: '',
  initApp(apiKey, iosAppId, androidAppId) {
    this.apiKey = apiKey;
    this.iosAppId = iosAppId;
    this.androidAppId = androidAppId;
  },
  getAppId() {
    let key = '';
    const name = Device.os.getName();

    if (name === 'Android') key = this.androidAppId;
    if (name === 'iOS') key = this.iosAppId;

    return key;
  },
  appIsLastest(cb) {
    let isLastest = true;
    const getVersionNum = (version) => {
      const versionList = Utils.stringToArray(version, '.');
      const num = parseInt(versionList[0], 10) * 100 + parseInt(versionList[1], 10) * 10 + parseInt(versionList[2], 10);
      return num;
    };

    this.appInfo((json) => {
      const data = json || [];
      const nowVersion = window.version.toString();
      // 检查是否是最新版本
      data.forEach((item) => {
        if (item.appIsLastest === '1') {
          console.log('应用名称', item.appName, '应用类型:', item.appType === '1' ? 'ios' : 'android', '应用最新版本:', item.appVersion, getVersionNum(item.appVersion), '应用当前版本', nowVersion, getVersionNum(nowVersion));
          if (getVersionNum(nowVersion) < getVersionNum(item.appVersion)) {
            this.appKey = item.appKey;
            isLastest = false;
          }
        }
      });
      console.log('是否是最新的应用', isLastest);
      cb && cb(isLastest);
    });
  },
  appInfo(cb) {
    if (Device.isPlus()) {
      $.ajax({
        type: 'POST',
        url: 'http://www.pgyer.com/apiv1/app/viewGroup',
        data: {
          aId: this.getAppId(),
          _api_key: this.apiKey
        },
        dataType: 'json',
        scriptCharset: 'UTF-8',
        success(json) {
          const jsonData = json.data;
          cb && cb(jsonData);
        }
      });
    }
  },
  appInstall() {
    if (Device.isPlus()) {
      window.location.href = `http://www.pgyer.com/apiv1/app/install?aKey=${this.appKey}&_api_key=${this.apiKey}&password=zhupai2017`;
    }
  },
  update() {
    this.appIsLastest((isLastest) => {
      if (!isLastest) {
        Device.nativeUI.confirm('提示', '检测到有新版本，请及时更新', () => {
          this.appInstall();
        });
      }
    });
  }
};
