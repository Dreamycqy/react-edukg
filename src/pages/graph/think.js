import React from 'react'
import echarts from 'echarts'
import _ from 'lodash'
import resizeListener, { unbind } from 'element-resize-event'
// import color from '@/constants/colorList'

export default class GraphChart extends React.Component {
  constructor(...props) {
    super(...props)
    this.dom = null
    this.instance = null
  }

  componentDidMount() {
    const { graph } = this.props
    try {
      this.instance = this.renderChart(this.dom, graph, this.instance)
      resizeListener(this.dom, () => {
        this.instance = this.renderChart(this.dom, graph, this.instance, true)
      })
    } catch (e) {
      console.log(e); // eslint-disable-line
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      graph, resize,
    } = nextProps
    return !_.isEqual(graph, this.props.graph) || resize !== this.props.resize
  }

  componentDidUpdate() {
    const { graph } = this.props
    this.instance = this.renderChart(this.dom, graph, this.instance)
  }

  componentWillUnmount() {
    unbind(this.dom)
    this.instance && this.instance.dispose()  //  eslint-disable-line
  }

  renderChart = (dom, graph, instance, forceUpdate = false) => {
    let options
    if (!graph) {
      options = {
        ...options,
        title: {
          // text: '暂无数据',
          x: '56%',
          y: 'center',
        },
      }
    } else {
      options = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
        },
        title: {
          text: '地球 的相关知识导图',
        },
        series: [
          {
            type: 'tree',

            data: [graph],

            top: '1%',
            left: '7%',
            bottom: '1%',
            right: '20%',

            symbolSize: 7,

            label: {
              position: 'left',
              verticalAlign: 'middle',
              align: 'right',
              fontSize: 9,
            },

            leaves: {
              label: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left',
              },
            },

            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750,
          },
        ],
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
    return (
      <div className="e-charts-graph" ref={t => this.dom = t} style={{ height: '100%', width: '100%' }} />
    )
  }
}
