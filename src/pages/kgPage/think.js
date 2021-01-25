import React from 'react'
import echarts from 'echarts'
import _ from 'lodash'
import resizeListener, { unbind } from 'element-resize-event'
import subList from '@/constants/subject'
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

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { graph } = nextProps
    this.instance = this.renderChart(this.dom, graph, this.instance)
  }

  componentWillUnmount() {
    unbind(this.dom)
    this.instance && this.instance.dispose()  //  eslint-disable-line
  }

  handleCmcc = (list, subjectName) => {
    console.log(list)
    const result = []
    const map = {
      3: {},
      4: {},
      5: {},
      6: {},
    }
    list.forEach((e) => {
      if (!map[e['层级节点']][e['知识点编码']]) {
        map[e['层级节点']][e['知识点编码']] = {
          ...e,
          name: e['知识点名称'],
          key: e['知识点编码'],
          children: [],
          type: e['层级节点'] === '6' ? 'instance' : 'category',
          collapsed: true,
          label: {
            fontWeight: e['层级节点'] === '6' ? 700 : null,
            position: 'bottom',
            rotate: 0,
            fontSize: 18,
          },
        }
      }
    })
    for (const i in map['6']) { // eslint-disable-line
      const code = map['6'][i]['知识点编码']
      const father = code.substr(0, code.length - 3)
      if (map['5'][father]) {
        map['5'][father].children.push(map['6'][i])
      }
    }
    for (const i in map['5']) { // eslint-disable-line
      const code = map['5'][i]['知识点编码']
      const father = code.substr(0, code.length - 3)
      if (map['4'][father]) {
        map['4'][father].children.push(map['5'][i])
      }
    }
    for (const i in map['4']) { // eslint-disable-line
      const code = map['4'][i]['知识点编码']
      const father = code.substr(0, code.length - 3)
      if (map['3'][father]) {
        map['3'][father].children.push(map['4'][i])
      }
    }
    for (const i in map['3']) { // eslint-disable-line
      result.push(map['3'][i])
    }
    return {
      name: subjectName,
      key: subjectName,
      children: result,
      label: {
        normal: {
          rotate: 0,
          offset: [-38, 0],
          verticalAlign: 'middle',
          backgroundColor: '#7049f0',
          color: '#fff',
          padding: 3,
          formatter: [
            '{box|{b}}',
          ].join('\n'),
          rich: {
            box: {
              height: 30,
              color: '#fff',
              padding: [0, 5],
              align: 'center',
            },
          },
        },
      },
    }
  }

  renderChart = (dom, graph, instance, forceUpdate = false) => {
    const that = this
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
      const { subject } = this.props
      const subjectName = _.find(subList, { value: subject }).name
      const data = graph.filter((e) => {
        return e['学科名称'] === subjectName
      })
      const result = this.handleCmcc(data, subjectName)
      options = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
        },
        series: [
          {
            type: 'tree',
            roam: true,
            data: result.children.length > 0 ? [result] : [],
            layout: 'radial',
            top: '1%',
            left: '7%',
            bottom: '1%',
            right: '20%',

            symbol: 'rect',
            symbolSize: 30,

            label: {
              normal: {
                rotate: 0,
                offset: [0, -20], // [-35, 0]
                verticalAlign: 'middle',
                backgroundColor: '#7049f0',
                color: '#fff',
                padding: 3,
                formatter: [
                  '{box|{b}}',
                ].join('\n'),
                rich: {
                  box: {
                    height: 30,
                    color: '#fff',
                    padding: [0, 5],
                    align: 'center',
                  },
                },
              },
            },
            leaves: {
              label: {
                normal: {
                  offset: [0, -20],
                  verticalAlign: 'middle',
                  backgroundColor: '#c44eff',
                  formatter: [
                    '{box|{b}}',
                  ].join('\n'),
                  rich: {
                    box: {
                      height: 30,
                      color: '#fff',
                      padding: [0, 5],
                      align: 'center',
                    },
                  },
                },
              },
            },
            itemStyle: {
              height: 18,
              width: 30,
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
    // if (myChart._$handlers.click) { // eslint-disable-line
    //   myChart._$handlers.click.length = 0 // eslint-disable-line
    // }
    // myChart.on('click', (params) => {
    //   that.props.getNewInstance(params.data['知识点编码'])
    // })
    return myChart
  }

  render() {
    return (
      <div className="e-charts-graph" ref={t => this.dom = t} style={{ height: '100%', width: '100%' }} />
    )
  }
}
