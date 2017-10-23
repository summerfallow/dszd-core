const $ = window.jQuery;

const Connect = function Connect() {
  let httpInterface = null;
  let queryInterface = {};
  let resourceInterface = {
    weixin: {name: 'weixin', url: 'https://res.wx.qq.com/open/js/jweixin-1.2.0.js'},
    baiDuMap: {url: 'https://api.map.baidu.com/getscript?v=2.0&ak=KyaNGEAhNxLkAPWE7A4PYNy9zPaZ9iYd', name: '百度地图'},
    eCharts: {url: 'https://cdn.bootcss.com/echarts/3.4.0/echarts.min.js', name: 'eCharts'},
  };
  let handleComplete = null;
  let handleBefore = null;

  // 初始化接口
  this.init = (options = {}) => {
    httpInterface = options.httpInterface;
    resourceInterface = Object.assign({}, resourceInterface, options.resourceInterface);
    handleComplete = options.handleComplete;
    handleBefore = options.handleBefore;
    console.log('Connect 初始化成功');
  };

  // 设置额外的参数
  this.setQuery = (query = {}) => {
    queryInterface = Object.assign({}, queryInterface, query);
  };

  // 设置额外的参数
  this.clearQuery = (key) => {
    // 删除指定的key，没有的指定的key删除全部
    if (key) {
      delete queryInterface[key];
    } else {
      queryInterface = {};
    }
  };

  // 访问接口
  this.getApi = function getApi(id, query = {}, data = {}, success, error, fail = 1) {
    if (!httpInterface) console.error('Connect 未初始化');

    const that = this;
    const api = httpInterface[id];
    const url = window[api.baseUrl] || window.baseUrl;
    const startTime = new Date().getTime();
    const queryData = Object.assign({}, query, data, queryInterface);

    if (!api) {
      console.error(`不存在接口id:${id}`);
      error && error();
      return;
    }

    if (handleBefore) {
      const flag = handleBefore(id, query, data, success);
      if (!flag) return;
    }

    $.ajax({
      type: api.type,
      url: url + api.url,
      data: queryData,
      dataType: 'json',
      scriptCharset: 'UTF-8',
      success(json) {
        const endTime = new Date().getTime();
        console.log(`访问接口${id}${api.name}成功 响应时间${endTime - startTime}ms`, queryData, json);
        if (json.status === 1) {
          if (handleComplete.success) {
            handleComplete.success && handleComplete.success(api, json, success);
          } else {
            success && success(json);
          }
        } else if (json.status === 3) {
          if (handleComplete) {
            handleComplete.noLogin && handleComplete.noLogin(api, json, error);
          } else {
            error && error();
          }
        } else if (json.status === 4) {
          if (handleComplete) {
            handleComplete.noAuth && handleComplete.noAuth(api, json, error);
          } else {
            error && error();
          }
        } else {
          console.log('默认错误处理');
          if (handleComplete) {
            handleComplete.error && handleComplete.error(api, json, error);
          } else {
            error && error();
          }
        }
      },
      error(e) {
        if (fail <= 3) {
          console.log(`访问接口${id}${api.name}失败: 尝试重新连接 第${fail}次`, e.status, e.responseJSON);
          that.getApi(id, query, data, success, error, fail + 1);
        } else {
          const json = e.responseJSON || {};
          console.log('网络连接错误');

          if (json.status === -1) {
            if (handleComplete.sysUpdate) {
              handleComplete.sysUpdate && handleComplete.sysUpdate(api, json, error);
            } else {
              error && error();
            }
          } else if (handleComplete.noNetwork) {
            handleComplete.noNetwork && handleComplete.noNetwork(api, json, error);
          } else {
            error && error();
          }
        }
      }
    });
  };

  // 访问资源文件
  this.getScript = (name, success) => {
    const resource = resourceInterface[name];
    if (!resource) {
      console.error(`不存在资源:${name}`);
      return;
    }

    $.getScript(resource.url, () => {
      console.log(`访问资源${name}成功`);
      success && success();
    });
  };
};

const connect = new Connect();
export default connect;
