import regeneratorRuntime from '../../lib/runtime'
import moment from '../../lib/moment'
const app = getApp()
Component({
  properties: {
    start: {
      type: Array,
      value: []
    }
  },
  data: {
    range: [[1, 2], [3, 4], [5, 6]],
    local_start: [],
    indexs: [],
    values: []
  },
  ready() {

  },
  methods: {
    bindChange(e) {
      let { range, indexs } = this.data
      let date_index = indexs[0] || 0,
        hour_index = indexs[1] || 0,
        minute_index = indexs[2] || 0
      let date = range[0][date_index],
        hour = range[1][hour_index],
        minute = range[2][minute_index]
      this.triggerEvent('update', {
        value: [date, hour, minute]
      })
    },
    bindColumnChange(e) {
      let { detail: { column, value } } = e

      let values = app._deepClone(this.data.values)
      let range = app._deepClone(this.data.range)
      let indexs = app._deepClone(this.data.indexs)
      // 初始化
      if (!values[0]) {
        indexs[0] = 0
        values[0] = range[0][0]
      }
      if (!values[1]) {
        indexs[1] = 0
        values[1] = range[1][0]
      }
      if (!values[2]) {
        indexs[2] = 0
        values[2] = range[2][0]
      }
      // 更新
      indexs[column] = value
      values[column] = range[column][value]

      if (column === 2) {
        // column 2 不更新range
      } else {
        range = this.updateRange(values[0], values[1])
        // 如果原先的值存在于新的range，则按原来的值，否则设置新的range的第一项
        let date_index = range[0].indexOf(values[0])
        if (date_index === -1) {
          indexs[0] = 0
          values[0] = range[0][0]
        } else {
          indexs[0] = date_index
          values[0] = range[0][date_index]
        }
        let hour_index = range[1].indexOf(values[1])
        if (hour_index === -1) {
          indexs[1] = 0
          values[1] = range[1][0]
        } else {
          indexs[1] = hour_index
          values[1] = range[1][hour_index]
        }
        let minute_index = range[2].indexOf(values[2])
        if (!values[2] || minute_index === -1) {
          indexs[2] = 0
          values[2] = range[2][0]
        } else {
          indexs[2] = minute_index
          values[2] = range[2][minute_index]
        }
      }
      this.setData({
        range: range,
        values: values,
        indexs: indexs
      })
    },
    async tapPicker() {
      let [start_date, start_hour, start_minute] = this.data.start
      let local_start
      if (start_date && start_hour && start_minute) {
        local_start = [start_date, start_hour, start_minute]
      } else {
        let now = moment().add(10, 'm')
        local_start = [now.format('YYYY-MM-DD'), now.format('H'), now.format('m')]
      }
      await new Promise(resolve => {
        this.setData({
          local_start: local_start
        }, resolve)
      })
      let range = this.updateRange()

      this.setData({
        range: range
      })
    },
    updateRange(column_date, column_hour) {
      let [start_date, start_hour, start_minute] = this.data.local_start

      //可选到下个月今天
      let end_date = moment()
        .add(1, 'months')
      let dates = [moment(start_date)
          .format('YYYY-MM-DD')],
        stop = false
      for (let i = 1; stop !== true; i++) {
        let date = moment(start_date)
          .add(i, 'd')
          .format('YYYY-MM-DD')
        if (end_date.isAfter(date)) {
          dates.push(date)
        } else {
          stop = true
        }
      }
      let hours = [],
        minutes = []
      let hour = 0,
        minute = 0;
      if (!column_date || !column_hour) {
        hour = start_hour
        minute = start_minute
      } else if (column_date === start_date) {
        hour = start_hour
        if (Number(column_hour) <= Number(start_hour)) {
          minute = start_minute
        }
      }
      for (let i = Number(hour); i < 24; i++) {
        let hour_str = i
        if (i < 10) {
          hour_str = '0' + i
        }
        hours.push('' + hour_str)
      }
      for (let i = Number(minute); i < 60; i++) {
        let minute_str = i
        if (i < 10) {
          minute_str = '0' + i
        }
        minutes.push('' + minute_str)
      }
      return [dates, hours, minutes]
    }
  }
})
