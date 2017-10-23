import Connect from './connect';

let wx = window.wx || {};
let shareOptions = {
  title: '分享标题', // 分享标题
  desc: '分享描述' // 分享描述
};
const $ = window.jQuery;
const ShareList = ['onMenuShareAppMessage', 'onMenuShareTimeline', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'];

const Weixin = {
  init(options = {}, cb) {
    // 初始化参数
    const url = options.url || `${window.baseUrl}/wx/getShareConfig`;
    shareOptions = Object.assign({}, shareOptions, options.shareOptions);
    // 获取资源
    Connect.getScript('weixin', () => {
      $.ajax({
        url,
        type: 'GET',
        dataType: 'json',
        data: {
          url: location.href.split('#')[0]
        },
        success(json) {
          wx = window.wx;
          const data = json.data || {};
          const config = data.Config;

          wx.config && wx.config({
            debug: false,
            appId: config.appId, // 必填，公众号的唯一标识
            timestamp: config.timestamp, // 必填，生成签名的时间戳
            nonceStr: config.nonceStr, // 必填，生成签名的随机串
            signature: config.signature, // 必填，签名，见附录1
            jsApiList: [
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'onMenuShareQQ',
              'onMenuShareWeibo',
              'onMenuShareQZone',
              'chooseImage',
              'uploadImage'
            ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
          });

          // 初始化分享接口
          Weixin.initShare();
          //
          cb && cb();
        }
      });
    });
  },
  // 初始化分享获取分享
  getShareUrl() {
    const href = window.location.href;
    const index = href.indexOf('?_k');
    const shareLink = href.substring(0, index);
    return shareLink;
  },
  getShareImgUrl() {
    const href = window.location.href;
    const index = href.indexOf('index.html');
    const shareImgUrl = `${href.substring(0, index)}/include/weixin/images/logo.jpg`;
    return shareImgUrl;
  },
  // 初始化分享
  initShare(options = {}) {
    const title = options.title || shareOptions.title; // 分享标题
    const desc = options.desc || shareOptions.desc; // 分享描述
    const link = options.link || this.getShareUrl(); // 分享链接
    const imgUrl = options.imgUrl || this.getShareImgUrl(); // 分享图标

    wx.ready && wx.ready(() => {
      ShareList.forEach((item) => {
        wx[item]({
          title, // 分享标题
          desc, // 分享描述
          link, // 分享链接
          imgUrl, // 分享图标
          // 用户确认分享后执行的回调函数
          success() {},
          // 用户取消分享后执行的回调函数
          cancel() {}
        });
      });
    });
  }
};

export default Weixin;
