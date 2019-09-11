import React from 'react'
import echarts from 'echarts'
import _ from 'lodash'
import resizeListener, { unbind } from 'element-resize-event'

export default class GraphChart extends React.Component {
  constructor(...props) {
    super(...props)
    this.dom = null
    this.instance = null
  }

  componentDidMount() {
    const { series } = this.props
    try {
      this.instance = this.renderChart(this.dom, series, this.instance)
      resizeListener(this.dom, () => {
        this.instance = this.renderChart(this.dom, series, this.instance, true)
      })
    } catch (e) {
      console.log(e); // eslint-disable-line
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      series,
    } = nextProps
    return !_.isEqual(series, this.props.series)
  }

  componentDidUpdate() {
    const { series } = this.props
    this.instance = this.renderChart(this.dom, series, this.instance)
  }

  componentWillUnmount() {
    unbind(this.dom)
    this.instance && this.instance.dispose()  //  eslint-disable-line
  }

  renderChart = (dom, series, instance, forceUpdate = false) => {
    let options
    if (!series.list) {
      options = {
        ...options,
        title: {
          text: '暂无数据',
          x: '42%',
          y: 'center',
        },
      }
    } else {
      options = {
      }
    }
    let myChart = null
    if (forceUpdate === true) {
      myChart = instance
      myChart.resize()
      myChart.setOption(options)
      return myChart
    }
    if (instance) myChart = instance
    else myChart = echarts.init(dom)
    myChart.clear()
    myChart.resize()
    myChart.setOption(options)

    return myChart
  }

  render() {
    return <div className="e-charts-graph" ref={t => this.dom = t} style={{ height: '100%' }} />
  }
}
