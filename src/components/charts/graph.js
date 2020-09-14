import React from 'react'
import echarts from 'echarts'
import _ from 'lodash'
import resizeListener, { unbind } from 'element-resize-event'
import color from '@/constants/colorList'

export default class GraphChart extends React.Component {
  constructor(...props) {
    super(...props)
    this.dom = null
    this.instance = null
  }

  componentDidMount() {
    const { graph, forcename } = this.props
    try {
      this.instance = this.renderChart(this.dom, graph, forcename, this.instance)
      resizeListener(this.dom, () => {
        this.instance = this.renderChart(this.dom, graph, forcename, this.instance, true)
      })
    } catch (e) {
      console.log(e); // eslint-disable-line
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      graph,
    } = nextProps
    return !_.isEqual(graph, this.props.graph)
  }

  componentDidUpdate() {
    const { graph, forcename } = this.props
    this.instance = this.renderChart(this.dom, graph, forcename, this.instance)
  }

  componentWillUnmount() {
    unbind(this.dom)
    this.instance && this.instance.dispose()  //  eslint-disable-line
  }

  openOrFold = (param, graph) => {
    const { name, category, open } = param.data
    if (category !== '1') {
      return
    }
    const { nodes, links } = graph
    const newNodes = nodes
    if (open === true) {
      if (_.find(newNodes, { name }) !== undefined) {
        _.find(newNodes, { name }).open = false
        links.forEach((e) => {
          if (e.target === name) {
            _.find(newNodes, { name: e.source }).show = false
          }
        })
      }
    } else if (_.find(newNodes, { name }) !== undefined) {
      _.find(newNodes, { name }).open = true
      links.forEach((e) => {
        if (e.target === name) {
          _.find(newNodes, { name: e.source }).show = true
        }
      })
    }
    this.renderChart(this.dom, { nodes: newNodes, links }, this.props.forcename, this.instance)
  }

  jumpToGraph = (param) => {
    const { data } = param
    const { category, uri, name, type } = data
    if (category === '0') {
      return
    }
    if (category !== '1') {
      this.props.handleExpandGraph({
        uri,
        name,
        type,
      })
    }
  }

  hide = (array) => {
    const result = []
    array.forEach((e) => {
      if (e.category === '2') {
        if (e.show === true) {
          result.push(e)
        }
      } else {
        result.push(e)
      }
    })
    return result
  }

  renderChart = (dom, graph, forcename, instance, forceUpdate = false) => {
    let options
    const that = this
    let targetIndex = 0
    if (!graph.nodes || graph.nodes.length < 1) {
      options = {
        ...options,
        title: {
          // text: '暂无数据',
          x: '56%',
          y: 'center',
        },
      }
    } else {
      const nodes = that.hide(_.uniqBy(graph.nodes, 'name'))
      targetIndex = _.findIndex(nodes, { name: forcename })
      if (this.props.newClassGraph) {
        nodes.forEach((e) => {
          if (e.name === forcename) {
            e.symbolSize = 60
            e.category = e.type === 'class' ? '0' : '2'
            e.label.normal.textStyle = {
              color: '#000000',
              fontWeight: '700',
              fontSize: '16',
            }
          } else {
            e.symbolSize = 20
            e.category = e.type === 'class' ? '3' : '2'
            e.label.normal.textStyle = {
              color: '#000000',
              fontWeight: 'normal',
              fontSize: '12',
            }
          }
        })
      }
      options = {
        color: color['line'],
        series: [{
          type: 'graph',
          layout: 'force',
          focusNodeAdjacency: true,
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          name: forcename,
          roam: true,
          force: {
            initLayout: 'circular',
            repulsion: 50,
            gravity: 0.01,
            edgeLength: 100,
            layoutAnimation: true,
          },
          gravity: 1,
          tooltip: {
            trigger: 'item',
            textStyle: {
              fontSize: 12,
            },
          },
          linkSymbol: 'arrow',
          categories: [
            {
              name: '0',
            },
            {
              name: '1',
            },
            {
              name: '2',
            },
            {
              name: '3',
            },
          ],
          minRadius: 1,
          maxRadius: 5,
          coolDown: 0.995,
          steps: 10,
          nodes,
          links: graph.links,
        }],
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
    if (myChart._$handlers.click) { // eslint-disable-line
      myChart._$handlers.click.length = 0 // eslint-disable-line
    } if (myChart._$handlers.dblclick) { // eslint-disable-line
      myChart._$handlers.dblclick.length = 0 // eslint-disable-line
    }
    myChart.on('click', (params) => {
      that.jumpToGraph(params)
    })
    myChart.on('dblclick', (params) => {
      that.openOrFold(params, graph)
    })
    options.series[0].center = myChart._chartsViews[0]._symbolDraw._data._itemLayouts[targetIndex]
    myChart.setOption(options)
    return myChart
  }

  render() {
    return <div className="e-charts-graph" ref={t => this.dom = t} style={{ height: '100%' }} />
  }
}
