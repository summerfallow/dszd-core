import Moment from 'moment';

const Utils = {
  // 时间格式化
  dateFormat(date, fmt = 'yyyy/MM/dd HH:mm:ss'){
    if(!date) return '';

    if(!this.isObject(date)){
      date = Moment(date).toDate();
    }

    if(this.isObject(date) && date._isAMomentObject) {
      date = date.toDate();
    }

    var o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'H+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      'S': date.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    return fmt;
  },
  /**
   * @description 获取uuid
   **/
  getUUID(num = 16){
    var d = new Date().getTime();
    if (window.performance && typeof window.performance.now === 'function') {
      d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid.slice(0, num);
  },
  /**
   * @description 获取随机值
   * min <= return < max
   * @param {number} min 最小值
   * @param {number} max 最大值
   **/
  getLimitRandom(min = 0, max = 10){
    var _min = parseInt(min);
    var _max = parseInt(max);
    return Math.floor(Math.random() * (_max - _min + 1)) + _min;
  },
  /**
   * @description 获取数组
   * @param {string} name 名称
   **/
  getNumbersArray(num = 0){
    var numbersArray = [];
    for (var i = 0; i < num; i++) {
      numbersArray.push(i);
    }
    return numbersArray;
  },
  /**
   * @description 获取浏览器参数
   * @param {string} name 名称
   **/
  getQueryString(name){
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    var r = window.location.search.substr(1).match(reg);
    if (r != null)return unescape(r[2]);
    return null;
  },
  /**
   * @description 获取字符串的长度
   * @param {string} str
   **/
  getByteLen(str){
    for (var len = str.length, i = 0; i < str.length; i++) {
      str.charCodeAt(i) > 127 && len++;
    }

    return len;
  },
  /**
   * @description 是否是空值
   **/
  isNull (obj) {
    if(obj === undefined || obj === null || obj === NaN || obj === '') return false;
    else return true;
  },
  /**
   * @description 是否是数组
   **/
  isArray (obj) {
    return toString.call(obj) === '[object Array]';
  },
  /**
   * @description 是否是数字
   **/
  isNumber (obj) {
    return toString.call(obj) === '[object Number]';
  },
  /**
   * @description 是否是字符串
   **/
  isString (obj) {
    return toString.call(obj) === '[object String]';
  },
  /**
   * @description 是否是对象
   **/
  isObject (obj) {
    return toString.call(obj) === '[object Object]';
  },
  /**
   * @description 首字母大写
   **/
  upperFirstChar(str) {
    return str.replace(/^\S/,function(s){return s.toUpperCase();});
  },
  /**
   * @description 比较
   * @param {string} str
   **/
  isSame (e, t) {
    if (e === t)return true;
    if ('object' == typeof e) {
      if (!t)return false;
      if (Array.isArray(e)) {
        if (!Array.isArray(t) || e.length != t.length)return false;
        for (var n = 0; n < e.length; n++) {
          var r = e[n], i = t[n];
          if (!this.isSame(r, i))return false
        }
      } else {
        if (Array.isArray(t))return false;
        var o = Object.keys(e||{}), a = Object.keys(t||{});
        if (!this.isSame(o, a))return false;
        for (var n = 0; n < o.length; n++) {
          var s = o[n], r = e[s], i = t[s];
          if (!this.isSame(r, i))return false;
        }
      }
      return true;
    }
    return false;
  },
  /**
   * @description 格式化数字
   * @param {string} str
   **/
  priceFormat(num, count = 4) {
    let result = num || 0;
    let unit = '元';

    if (num >= 10000) {
      result = (num / 10000);
      unit = '万';
    }

    result = result.toString();

    const index = result.indexOf('.');
    if (index > -1) {
      const a = result.substr(0, index);
      const b = result.substr(index + 1);
      if (b.length > count) result = `${a}.${b.substr(0, count)}`;
      else result = `${a}.${b}`;
    }

    return `¥${result}${unit}`;
  },
  /**
   * @description 提交到服务端的数组格式化
   **/
  submitArrayFormat(data = [], name) {
    let value = {};
    data.forEach((item, index) => {
      console.log(item);
      const keys = Object.keys(item);
      keys.forEach((keysItem) => {
        value = Object.assign({}, value, {
          [`${name}[${index}].${keysItem}`]: item[keysItem]
        });
      });
    });
    console.log(value);
    return value;
  },
  /**
   * @description 字符串转数组
   **/
  stringToArray(str, name = '') {
    const temp = str || '';
    const list = [];
    temp.split(name).forEach((item) => {
      if (item) list.push(item);
    });
    return list;
  },
  /**
   * @description 数组转字符串
   **/
  arrayToString(array, str = '') {
    let result = '';
    const tempArray = array || [];
    tempArray.forEach((item, index) => {
      if (index) result += `${str}${item}`;
      else result += item;
    });
    return result;
  },
  /**
   * @description 获取对象值
   **/
  getObjectValue(obj, value) {
    const list = this.stringToArray(value, '.');
    let objValue = obj;

    list.forEach((item) => {
      objValue = objValue[item];
    });

    return objValue;
  },
  /**
   * @description 获取后缀名
   * @param {string} str
   **/
  getSuffix(str) {
    const temp = str || '';
    // 获取后缀名
    const index1 = temp.lastIndexOf('.');
    const index2 = temp.length;
    const suffix = temp.substring(index1 + 1, index2); // 后缀名
    return suffix;
  }
};

export default Utils;
