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
          if (e.source === name) {
            _.find(newNodes, { name: e.target }).show = false
          }
        })
      }
    } else if (_.find(newNodes, { name }) !== undefined) {
      _.find(newNodes, { name }).open = true
      links.forEach((e) => {
        if (e.source === name) {
          _.find(newNodes, { name: e.target }).show = true
        }
      })
    }
    this.renderChart(this.dom, { nodes: newNodes, links }, this.props.forcename, this.instance)
  }

  jumpToGraph = (param) => {
    const { data } = param
    const { category } = data
    if (category === '0') {
      return
    }
    if (category !== '1') {
      const { uri, course } = data
      window.open(`firstGraph?uri=${encodeURIComponent(uri)}&subject=${course}`)
    } else if (data.symbol === 'rect') {
      const { uri, course } = data
      window.open(`firstGraph?uri=${encodeURIComponent(uri)}&subject=${course}`)
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
    if (!graph.nodes || graph.nodes.length < 1) {
      options = {
        ...options,
        title: {
          text: '暂无数据',
          x: '56%',
          y: 'center',
        },
      }
    } else {
      const nodes = that.hide(graph.nodes)
      options = {
        series: [{
          type: 'graph',
          layout: 'force',
          name: forcename,
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
    return myChart
  }

  render() {
    return <div className="e-charts-graph" ref={t => this.dom = t} style={{ height: '100%' }} />
  }
}
