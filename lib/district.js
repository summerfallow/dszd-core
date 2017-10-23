const District = {
  // 格式化参数
  formatData(data, defaultValue) {
    const list = defaultValue ? [{
      value: '',
      label: '不限',
      children: [
        {
          value: '',
          label: '不限',
          children: [
            {
              value: '',
              label: '不限'
            }
          ]
        }
      ]
    }] : [];
    const format = function getData(a, b) {
      a.forEach((item) => {
        b.push({
          value: item.value,
          label: item.text,
          children: item.children ? format(item.children, defaultValue ? [{
            value: '',
            label: '不限',
            children: []
          }] : []) : []
        });
      });

      return b;
    };
    const result = format(data, list);
    // console.log('=============', result);
    // for(let i = 0; i < 40; i++) {
    //   console.log(`${data[i] && data[i].text}-${result[i] && result[i].label}`);
    // }
    // console.log('=============0000000', JSON.stringify(result));
    // console.log('=============0000000', JSON.parse(JSON.stringify(result)));

    return result;
  },
  // 根据城市编号获取省市区编号
  getAllCode(data, code) {
    const list = this.getCityListByCode(data, code);
    return list.length ? list.map(item => item.value) : null;
  },
  // 根据城市编号获取城市名称
  getNameByCode(data, code) {
    const list = this.getCityListByCode(data, code);
    return list.length ? list[list.length - 1].label : null;
  },
  // 根据城市编号获取省市区名称
  getAllNameByCode(data, code) {
    const list = this.getCityListByCode(data, code);
    return list.length ? list.map(item => item.label) : null;
  },
  // 根据城市编号获取省市区
  getCityListByCode(data, code) {
    const result = [];
    const getCityName = (cityList) => {
      let flag = null;
      cityList.forEach((cityItem) => {
        if (flag) return;
        //
        if (cityItem.value !== '' && cityItem.value === code) {
          flag = cityItem;
        } else {
          getCityName(cityItem.children || []) && (flag = cityItem);
        }
      });
      if (flag) result.push(flag);
      return flag;
    };
    getCityName(data);
    return result.reverse();
  }
};

export default District;
