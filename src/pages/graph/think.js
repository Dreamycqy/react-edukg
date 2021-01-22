/* eslint-disable prefer-destructuring */
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
    return !_.isEqual(graph, this.props.graph)
      || !_.isEqual(resize, this.props.resize)
      || !_.isEqual(select, this.props.select)
  }

  componentDidUpdate() {
    const { graph, select } = this.props
    this.instance = this.renderChart(this.dom, graph, select, this.instance)
  }

  componentWillUnmount() {
    unbind(this.dom)
    this.instance && this.instance.dispose()  //  eslint-disable-line
  }

  handleLine = (str) => {
    let string = str
    for (let i = 29; i < str.length; i += 30) {
      string = `${string.slice(0, i)}<br />${string.slice(i)}`
    }
    return string
  }

  handleCmcc = (list, subjectName, target) => {
    const result = []
    const map = {
      3: {},
      4: {},
      5: {},
    }
    let targetObj = {
      level: {},
    }
    list.forEach((e) => {
      if (!map[e['层级节点']][e['知识点编码']]) {
        map[e['层级节点']][e['知识点编码']] = {
          ...e,
          name: e['知识点名称'],
          key: e['知识点编码'],
          children: [],
        }
      }
      if (e['知识点编码'] === target) {
        map[e['层级节点']][e['知识点编码']].children.push({
          name: this.props.forcename,
          children: [],
        })
        targetObj = {
          ...e,
          level: {},
        }
      }
    })
    const targetCode = targetObj['知识点编码']
    if (targetObj['层级节点'] === '3') {
      targetObj.level['3'] = targetCode
    }
    if (targetObj['层级节点'] === '4') {
      targetObj.level['4'] = targetCode
      targetObj.level['3'] = targetCode.substr(0, targetCode.length - 3)
    }
    if (targetObj['层级节点'] === '5') {
      targetObj.level['5'] = targetCode
      targetObj.level['4'] = targetCode.substr(0, targetCode.length - 3)
      targetObj.level['3'] = targetCode.substr(0, targetCode.length - 6)
    }
    for (const i in map['5']) { // eslint-disable-line
      const code = map['5'][i]['知识点编码']
      const father = code.substr(0, code.length - 3)
      if (map['4'][father]) {
        if (targetObj.level['5']) {
          if (targetObj.level['5'] === code) {
            map['4'][father].children.push(map['5'][i])
          }
        } else {
          map['4'][father].children.push(map['5'][i])
        }
      }
    }
    for (const i in map['4']) { // eslint-disable-line
      const code = map['4'][i]['知识点编码']
      const father = code.substr(0, code.length - 3)
      if (map['3'][father]) {
        if (targetObj.level['4']) {
          if (targetObj.level['4'] === code) {
            map['3'][father].children.push(map['4'][i])
          }
        } else {
          map['3'][father].children.push(map['4'][i])
        }
      }
    }
    for (const i in map['3']) { // eslint-disable-line
      if (map['3'][i]['知识点编码'] === targetObj.level['3']) {
        result.push(map['3'][i])
      }
    }
    return {
      name: subjectName,
      key: subjectName,
      children: result,
    }
  }

  renderChart = (dom, graph, select, instance, forceUpdate = false) => {
    let options
    const { subject } = this.props
    const subjectName = _.find(subList, { value: subject }).name
    const data = graph.filter((e) => {
      return e['学科名称'] === subjectName
    })
    let target = ''
    const targetList = []
    const selectOne = select.filter((e) => { return e.predicateLabel === '分类' })
    selectOne.forEach((e) => {
      if (e.object.indexOf('cmcc/') > -1) {
        const code = e.object.split('category#')[1]
        if (target.length > code.length || target === '') {
          target = code
        }
      } else {
        targetList.push(e)
      }
    })
    if (target === '') {
      data.forEach((e) => {
        for (const i of targetList) {
          if (e['知识点名称'].indexOf(this.props.forcename) > -1 || e['知识点名称'].indexOf(i.objectLabel) > -1) {
            target = e['知识点编码']
          }
        }
      })
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
      const result = this.handleCmcc(data, subjectName, target)
      const that = this
      options = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
        },
        title: {
          text: `${this.props.forcename} 的相关知识导图`,
        },
        series: [
          {
            type: 'tree',
            // layout: 'radial',
            data: result.children.length > 0 ? [result] : [],
            initialTreeDepth: 3,
            top: '1%',
            left: '7%',
            bottom: '1%',
            right: '20%',
            tooltip: {
              trigger: 'item',
              formatter: (params) => {
                let res = '<div>'
                res += `<div>${params.data.name}</div>`
                if (params.data.name === this.props.forcename) {
                  res += '<br />'
                  select.forEach((e, index) => {
                    if (index < 5) {
                      if (e.object.length < 150) {
                        if (e.labelList) {
                          res += `<div>${e.predicateLabel}：${that.handleLine(e.labelList.join('，'))}<br /><br /></div>`
                        }
                      }
                    } else if (e.predicateLabel === '内容') {
                      res += `<div>${e.predicateLabel}：${that.handleLine(e.labelList.join('，'))}<br /><br /></div>`
                    }
                  })
                }
                res += '</div>'
                return res
              },
            },
            symbol: 'rect',
            symbolSize: 30,
            edgeShape: 'polyline',
            label: {
              normal: {
                position: 'right',
                distance: -40,
                verticalAlign: 'middle',
                align: 'left',
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
                  position: 'right',
                  distance: -40,
                  verticalAlign: 'middle',
                  align: 'left',
                  backgroundColor: '#c44eff',
                  formatter: [
                    '{box|{b}}',
                  ].join('\n'),
                  rich: {
                    box: {
                      height: 18,
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
            animationDuration: 200,
            animationDurationUpdate: 200,
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
      <div className="e-charts-graph" ref={(t) => this.dom = t} style={{ height: '100%', width: '100%' }} />
    )
  }
}
