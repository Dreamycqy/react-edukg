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
    const { graph, select } = this.props
    try {
      this.instance = this.renderChart(this.dom, graph, select, this.instance)
      resizeListener(this.dom, () => {
        this.instance = this.renderChart(this.dom, graph, select, this.instance, true)
      })
    } catch (e) {
      console.log(e); // eslint-disable-line
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      graph, select, resize,
    } = nextProps
    return !_.isEqual(graph, this.props.graph) || resize !== this.props.resize || !_.isEqual(select, this.props.select)
  }

  componentDidUpdate() {
    const { graph, select } = this.props
    this.instance = this.renderChart(this.dom, graph, select, this.instance)
  }

  componentWillUnmount() {
    unbind(this.dom)
    this.instance && this.instance.dispose()  //  eslint-disable-line
  }

  pushSelect = (graph, select) => {
    let time = 0
    if (graph.children) {
      graph.children.forEach((e, index) => {
        if (time === 1) {
          return
        } else if (e.name === select.objectLabel) {
          if (!e.children) {
            e.children = []
          }
          if (e.children.filter((e) => { return e.name === this.props.forcename }).length === 0) {
            e.children.push({
              name: this.props.forcename,
              children: [],
              itemStyle: {
                borderWidth: 4,
              },
              label: {
                position: 'right',
                distance: 8,
                fontSize: 14,
                fontWeight: 700,
              },
            })
          }
          time = 1
        } else {
          e = this.pushSelect(e, select)
        }
      })
    }
    return graph
  }

  renderChart = (dom, graph, select, instance, forceUpdate = false) => {
    let options
    const selectOne = select.filter((e) => { return e.predicateLabel === '分类' })
    if (selectOne.length > 0) {
      this.pushSelect(graph, selectOne[0])
    }
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
          text: this.props.forcename + ' 的相关知识导图',
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
