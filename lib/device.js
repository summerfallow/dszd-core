import { Toast, Modal } from 'antd-mobile';
import EXIF from 'exif-js';
import Utils from './utils';
import History from './history';

let isOpen = false;
let plus = window.plus;
const Alert = Modal.alert;
const alertList = [];
let alertFlag = false;

const Device = {
  getPlus() {
    return window.plus;
  },
  isPlus() {
    plus = window.plus;
    const ua = window.navigator.userAgent;
    const index = ua.indexOf('Html5Plus');
    return !!(index > -1);
  },
  webView: {
    open(url, query, onClose, onLoad, extras = {}) {
      // 是否正在打开
      if (isOpen) return;
      // 设置历史记录
      const id = Utils.getUUID();
      History.forward(id, url, false, query);
      // 窗口动画
      const aniShow = extras.aniShow || 'pop-in';
      const header = extras.header === undefined ? true : extras.header;
      // 绘制导航栏
      let statusbarHeight = 0;
      const docEl = document.documentElement;
      const clientWidth = docEl.clientWidth;
      const num = clientWidth / 750;
      const getSize = (size, other = 0) => `${size * num + other}px`;
      if (Device.navigator.isImmersedStatusbar()) {
        statusbarHeight = Device.navigator.getStatusbarHeight();
      }
      // 默认布局
      const view = new plus.nativeObj.View('header', {height: getSize(90, statusbarHeight), backgroundColor: window.barBackground || '#f5f5f5'});
      // 新建窗口
      const timeStart = new Date().getTime();
      const newUrl = `index.html#${url}`;
      const wv = plus.webview.create(newUrl, id, {
        // navigationbar: {'backgroundColor':'#e4423f','titleText':'导航栏标题','titleColor':'#ffffff'},
        // subNViews: [view],
        background: '#f5f5f5'
      }, extras);
      const openWindow = () => {
        plus.webview.show(id, aniShow, 300, () => {
          // 打开完毕
          isOpen = false;
          onLoad && onLoad();
        });
      };

      // 开始打开
      isOpen = true;
      // 显示默认头部，为了增加应用的流畅性
      if (header) wv.append(view);
      // 延时打开窗口
      openWindow();

      wv.addEventListener('loaded', () => {
        const timeEnd = new Date().getTime();
        console.log('窗口加载成功', id, url, '加载时间', timeEnd - timeStart);
        setTimeout(() => {
          view.close(view);
        }, 400);
      }, false);

      wv.addEventListener('close', () => {
        console.log('窗口关闭', url);
        const data = Device.webView.getData();
        History.back();
        onClose && onClose(data);
      }, false);
    },
    close() {
      const webview = plus.webview.currentWebview();
      const id = webview.id;
      const aniClose = webview.aniClose || 'auto';
      plus.webview.close(id, aniClose);
    },
    currentWebview() {
      if (!Device.isPlus()) return null;
      return plus.webview.currentWebview();
    },
    creata(url, id, styles, extras) {
      if (Device.isPlus()) {
        return plus.webview.create(url, id, styles, extras);
      } else {
        return null;
      }
    },
    toLaunch() {
      const all = plus.webview.all();
      const vm = plus.webview.getLaunchWebview();
      const vmId = vm.id;
      vm.evalJS('window.location="index.html#/user/login"');

      // 当窗口多余一个的时候
      if (all.length > 1) {
        all.forEach((item) => {
          if (item.id !== vmId) {
            plus.webview.close(item.id);
          }
        });
      }
    },
    setData(data) {
      const opener = History.getOpener();
      opener.close = data;
      History.setItem(opener, 'close');
    },
    getData() {
      const opener = History.getOpener();
      return opener.close;
    },
    getQueryData() {
      const current = History.getCurrent();
      return current.query;
    }
  },
  storage: {
    getItem: (name) => {
      let value;
      // console.log('开始获取 storage');

      if (Device.isPlus()) {
        // console.log('plus storage', plus, plus.storage);
        value = plus.storage.getItem(name);
      } else {
        // console.log('web storage');
        value = window.localStorage.getItem(name);
      }

      return JSON.parse(value);
    },
    setItem: (name, value) => {
      if (Device.isPlus()) {
        plus.storage.setItem(name, JSON.stringify(value));
      } else {
        window.localStorage.setItem(name, JSON.stringify(value));
      }
    }
  },
  sessionStorage: {
    getItem: (name) => {
      let value;
      if (Device.isPlus()) {
        value = window.localStorage.getItem(name);
      } else {
        value = window.sessionStorage.getItem(name);
      }
      return JSON.parse(value);
    },
    setItem: (name, value) => {
      if (Device.isPlus()) {
        window.localStorage.setItem(name, JSON.stringify(value));
      } else {
        window.sessionStorage.setItem(name, JSON.stringify(value));
      }
    },
    clear: () => {
      if (Device.isPlus()) {
        window.localStorage.clear();
      } else {
        window.sessionStorage.clear();
      }
    }
  },
  utils: {
    dial(number, confirm = true) {
      if (Device.isPlus()) {
        plus.device.dial(number, confirm);
      } else {
        window.location.href = `tel://${number}`;
      }
    }
  },
  messaging: {
    send(number = '', body = '') {
      if (Device.isPlus()) {
        const msg = plus.messaging.createMessage(plus.messaging.TYPE_SMS);
        msg.to = [number];
        msg.body = body;
        plus.messaging.sendMessage(msg);
      }
    }
  },
  nativeUI: {
    toast(message = '') {
      if (Device.isPlus()) {
        plus.nativeUI.toast(message, {
          verticalAlign: 'center'
        });
      } else {
        Toast.info(message);
      }
    },
    alert(title = '', message = '', btn = '确定', callback) {
      // 是否存在内容相同的alert
      let isExist = false;
      // 显示alert
      const showAlert = () => {
        const item = alertList.length ? alertList[0] : null;
        const alertCallback = () => {
          alertFlag = false;
          alertList.pop();
          callback && callback();
          // 显示下一个alert
          showAlert();
        };

        // 判断队列里是否存在alert
        if (item) {
          if (Device.isPlus()) {
            plus.nativeUI.alert(message, () => {
              alertCallback();
            }, title, btn);
          } else {
            Alert(title, message, [
              {
                text: btn,
                onPress: () => {
                  alertCallback();
                }
              }
            ]);
          }
        }
      };

      alertList.forEach((item) => {
        if (item.title === title && item.message === message && item.btn === btn) isExist = true;
      });

      // 防止连续弹出内容相同的alert
      if (!isExist) {
        alertList.push({
          title,
          message,
          btn,
          callback
        });

        // 当前没有alert才能继续调用
        if (!alertFlag) {
          alertFlag = true;
          showAlert();
        }
      }
    },
    confirm(title, message, callback, btn = ['取消', '确定']) {
      if (Device.isPlus()) {
        plus.nativeUI.confirm(message, (e) => {
          if (e.index === 1) callback && callback();
        }, title, btn);
      } else {
        Alert(title, message, [
          { text: btn[0], onPress: () => {}, style: 'default' },
          { text: btn[1], onPress: () => { callback && callback(); }, style: { fontWeight: 'bold' } },
        ]);
      }
    },
    showWaiting: (title) => {
      if (Device.isPlus()) {
        plus.nativeUI.showWaiting(title);
      } else {
        Toast.loading(title, 0);
      }
    },
    closeWaiting: () => {
      if (Device.isPlus()) {
        plus.nativeUI.closeWaiting();
      } else {
        Toast.hide();
      }
    },
    /**
     * @description 弹出系统选择按钮框
     * @param {array} btn 按钮数组 http://www.html5plus.org/doc/zh_cn/nativeui.html#plus.nativeUI.actionSheet
     * @param {object} options 上传文件列表 http://www.html5plus.org/doc/zh_cn/nativeui.html#plus.nativeUI.actionSheet
     * @param {function} complete 回调函数 返回选择索引,0表示用户点击取消按钮，大于0值表示用户点击ActionSheetStyles中buttons属性定义的按钮
     **/
    actionSheet: (btn, options, complete) => {
      if (!Device.isPlus()) return;
      plus.nativeUI.actionSheet(Object.assign({}, {
        cancel: '取消',
        buttons: btn
      }), (e) => {
        complete && complete(e.index);
      });
    }
  },
  navigator: {
    isImmersedStatusbar() {
      if (Device.isPlus()) {
        return plus.navigator.isImmersedStatusbar();
      }

      return false;
    },
    getStatusbarHeight() {
      if (Device.isPlus()) {
        return plus.navigator.getStatusbarHeight();
      }

      return 0;
    }
  },
  os: {
    getName() {
      if (Device.isPlus()) {
        return plus.os.name;
      }

      return 'web';
    }
  },
  runtime: {
    openURL: (url) => {
      if (Device.isPlus()) {
        plus.runtime.openURL(url);
      } else {
        location.href = url;
      }
    }
  },
  /**
   * @description 相册模块
   **/
  gallery: {
    /**
     * @description 判断图片是否发生旋转
     * @param {string} url 配置信息 http://www.html5plus.org/doc/zh_cn/gallery.html#plus.gallery.GalleryOptions
     * @param {function} complete 回调函数 @return {num} 旋转角度
     **/
    isOrientation: (url, complete) => {
      let rotate = 0;
      const image = new Image();
      image.src = url;
      image.onload = () => {
        EXIF.getData(image, () => {
          EXIF.getAllTags(image);
          // 图片的旋转方向信息 1.图片没有发生旋转 6.顺时针90° 8.逆时针90° 3.180°旋转
          const orientation = EXIF.getTag(image, 'Orientation');
          if (orientation === 3) rotate = 180;
          if (orientation === 6) rotate = 90;
          if (orientation === 8) rotate = -90;
          complete && complete(rotate);
        });
      };
    },
    /**
     * @description 从系统相册选择图片
     * @param {object} options 配置信息 http://www.html5plus.org/doc/zh_cn/gallery.html#plus.gallery.GalleryOptions
     * @param {function} complete 回调函数 @return {string} 文件路径
     **/
    pick: (options, complete) => {
      if (!Device.isPlus()) return;
      plus.gallery.pick((event) => {
        complete && complete(event.files);
      }, (error) => {
        console.log('获取相册图片失败', error.code, error.message);
      }, Object.assign({}, {
        filter: 'image',
        maximum: 9,
        multiple: true
      }));
    },
    /**
     * @description 弹出系统选择框选择拍照或者从图库选择照片
     * @param {function} complete 回调函数 @return {string} 文件路径
     **/
    save: (path) => {
      if (!Device.isPlus()) return;
      plus.gallery.save(path, () => {
        console.log('保存照片到相册成功');
        // complete && complete(event.path);
      }, (error) => {
        console.log('保存照片到相册失败', error.code, error.message);
      });
    }
  },
  /**
   * @description 文件系统模块
   **/
  io: {
    /**
     * @description 通过URL参数获取目录对象或文件对象
     * @param {string} url 路径
     * @param {function} complete 回调函数 @return {object} http://www.html5plus.org/doc/zh_cn/io.html#plus.io.DirectoryEntry
     **/
    resolveLocalFileSystemURL: (url, complete) => {
      if (!Device.isPlus()) return;
      plus.io.resolveLocalFileSystemURL(url, (entry) => {
        console.log('获取文件目成功');
        complete && complete(entry);
      }, (error) => {
        console.log('获取文件目录失败', error.code, error.message);
      });
    }
  },
  /**
   * @description 上传模块本地
   **/
  uploader: {
    /**
     * @description 弹出系统选择框选择拍照或者从图库选择照片
     * @param {function} complete 回调函数 @return {array} 文件数组
     **/
    uploaderActionSheet: (complete) => {
      if (!Device.isPlus()) return;
      Device.nativeUI.actionSheet([{title: '拍照'}, {title: '照片图库'}], null, (index) => {
        // 拍照
        if (index === 1) {
          Device.camera.captureImage(null, (file) => {
            complete && complete([file]);
          });
        }
        // 从照片图库选择
        if (index === 2) {
          Device.gallery.pick(null, (files) => {
            complete && complete(files);
          });
        }

      });
    },
    /**
     * @description 上传图片列表模块
     * @param {string} url 上传地址
     * @param {array} files 上传文件列表
     * @param {object} query 上传文件需要的额外参数
     * @param {function} complete 回调函数 @return {array} 文件数组
     **/
    uploadImageList: (url, files, query, complete) => {
      if (!Device.isPlus()) return;
      const resultList = [];
      // 显示等待框
      Device.nativeUI.showWaiting('图片上传中');
      // 上传文件
      const uploadFile = () => {
        const filesItem = files.shift();
        Device.uploader.uploadImage(url, filesItem, query, (item) => {
          if (item) resultList.push(item);
          // 判断是否继续上传
          if (files.length) {
            uploadFile();
          } else {
            Device.nativeUI.closeWaiting();
            complete && complete(resultList);
          }
        });
      };
      uploadFile();
    },
    /**
     * @description 上传图片列表模块
     * @param {string} url 上传地址
     * @param {string} file 上传文件
     * @param {object} query 上传文件需要的额外参数
     * @param {function} complete 回调函数
     **/
    uploadImage: (url, file, query, complete) => {
      if (!Device.isPlus()) return;
      // 新建上传任务
      const task = plus.uploader.createUpload(url, {
        method: 'POST'
      }, (upload, status) => {
        if (status === 200) {
          const json = JSON.parse(upload.responseText) || {};
          const data = json.data || {};
          console.log('图片上传成功', data.url);
          complete && complete(data.url);
        } else {
          console.log('图片上传失败', status);
          // console.log(`Upload failed: ${status}`);
          complete && complete();
        }
      });
      // 监听上传任务
      // task.addEventListener('statechanged', (upload, status) => {
      //   // console.log('Upload listener: ', upload.uploadedSize / upload.totalSize);
      // }, false );
      // console.log('图片上传文件名:', file);
      // console.log('图片上传文件名:', Utils.getSuffix(file));
      // 图片压缩
      Device.zip.compressImage({
        src: file,
        dst: `_doc/photo/compressImage.${Utils.getSuffix(file)}`
      }, (dst) => {
        // 假如压缩失败就上传原图
        const result = dst || file;
        // 设置上传文件
        task.addFile(result, {
          key: 'file',
          name: 'file'
        });
        // 设置上传参数
        const queryKeys = Object.keys(query);
        queryKeys.forEach((item) => {
          task.addData(item, query[item]);
        });
        // 开始上传
        task.start();
      });
    }
  },
  /**
   * @description 语音模块
   **/
  speech: {
    /**
     * @description 开始语音识别
     * @param {object} options 配置信息 http://www.html5plus.org/doc/zh_cn/zip.html#plus.zip.CompressImageOptions
     * @param {function} complete 回调函数
     **/
    startRecognize: (options, complete) => {
      if (!Device.isPlus()) return;
      plus.speech.startRecognize({
        engine: 'iFly'
      }, (text) => {
        complete && complete(text);
      }, () => {
        complete && complete();
      });
    }
  },
  /**
   * @description 压缩模块
   **/
  zip: {
    /**
     * @description 压缩图片 http://www.html5plus.org/doc/zh_cn/zip.html#plus.zip.compressImage
     * @param {object} options 配置信息 http://www.html5plus.org/doc/zh_cn/zip.html#plus.zip.CompressImageOptions
     * @param {function} complete 回调函数
     **/
    compressImage: (options, complete) => {
      if (!Device.isPlus()) return;
      plus.zip.compressImage(Object.assign({}, {
        quality: 50,
        overwrite: true
      }, options), (event) => {
        console.log('图片压缩成功', event.target, event.size);
        complete && complete(event.target);
      }, (error) => {
        console.log('图片压缩失败', error.code, error.message);
        complete && complete();
      });
    },
    /**
     * @description 画布压缩图片
     * @param {object} options 配置信息 http://www.html5plus.org/doc/zh_cn/zip.html#plus.zip.CompressImageOptions
     * @param {function} complete 回调函数
     **/
    canvasCompressImage(options, complete) {
      const canvas = document.createElement('canvas');
      const optionsObj = Object.assign({}, {
        src: '', // 图片路径
        rotate: 0, // 选择角度
        quality: 50, // 压缩质量
        width: 240, // 压缩后的宽度
        height: 240, // 压缩后的高度
      }, options);
      if (!optionsObj.url) console.log('图片压缩失败 src不能为空');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = optionsObj.src;
      img.onload = () => {
        // 画布大小
        const canvasWidth = optionsObj.width;
        const canvasHeight = optionsObj.height;
        // 图片大小
        const imageWidth = img.width;
        const imageHeight = img.height;
        // 设置画布中心点
        const x = canvasWidth / 2;
        const y = canvasHeight / 2;
        // 画布图片大小
        let drawWidth = canvasWidth;
        let drawHeight = canvasHeight;
        let drawX = 0;
        let drawY = 0;
        // 图片的宽大于高
        if (imageWidth > imageHeight) {
          drawWidth = canvasHeight / imageHeight * imageWidth;
          drawHeight = canvasHeight;
          drawX = -1 * (drawWidth - canvasWidth) / 2;
          drawY = 0;
        }
        // 图片的高大于宽
        if (imageHeight > imageWidth) {
          drawWidth = canvasWidth;
          drawHeight = canvasWidth / imageWidth * imageHeight;
          drawX = 0;
          drawY = -1 * (drawHeight - canvasHeight) / 2;
        }
        // console.log('画布大小', canvasWidth, canvasHeight);
        // console.log('图片大小', imageWidth, imageHeight);
        console.log('画布图片大小', drawWidth, drawHeight, drawX, drawY);
        // 设置画布宽度和高度
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        // 先清掉画布上的内容
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // 将绘图原点移到画布中点
        ctx.translate(x, y);
        // 旋转角度
        ctx.rotate(optionsObj.rotate * Math.PI / 180);
        // 将画布原点移动
        ctx.translate(-x, -y);
        // 绘制图片
        ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
        // 返回base64格式数据
        const base64 = canvas.toDataURL(`image/${Utils.getSuffix(optionsObj.src)}`, optionsObj.quality / 100);
        complete && complete(base64);
      };
    }
  },
  /**
   * @description 位置模块
   **/
  geolocation: {
    /**
     * @description 获取当前设备位置
     * @param {object} options 配置信息 http://www.html5plus.org/doc/zh_cn/geolocation.html#plus.geolocation.getCurrentPosition
     * @param {function} complete 回调函数
     **/
    getCurrentPosition: (options, complete) => {
      if (!Device.isPlus()) return;
      plus.geolocation.getCurrentPosition((data) => {
        complete && complete(data);
      }, () => {
        complete && complete();
      }, options);
    }
  },
  /**
   * @description 摄像头模块
   **/
  camera: {
    /**
     * @description 拍照
     * @param {object} options 配置信息 http://www.html5plus.org/doc/zh_cn/camera.html#plus.camera.CameraOption
     * @param {function} complete 回调函数 @return {string} 本地路径
     **/
    captureImage: (options, complete) => {
      if (!Device.isPlus()) return;
      // 获取摄像头
      const camera = plus.camera.getCamera();
      // 开始拍照
      camera.captureImage((capturedFile) => {
        console.log('拍照成功', capturedFile);
        // 转换路径
        Device.io.resolveLocalFileSystemURL(capturedFile, (entry) => {
          const path = `file://${entry.fullPath}`;
          // 返回完整路径
          complete && complete(path);
        });
        // 保存照片到相册
        Device.gallery.save(capturedFile);
      }, (error) => {
        console.log('拍照错误', error.code, error.message);
      }, Object.assign({}, {
        filename: '_doc/photo/',
      }, options));
    }
  }
};

export default Device;
