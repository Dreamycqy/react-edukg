import React from 'react'
// import { Table, Modal, Input } from 'antd'
import echarts from 'echarts'
import _ from 'lodash'
import resizeListener, { unbind } from 'element-resize-event'
// import color from '@/constants/colorList'

// const { Search } = Input

export default class GraphChart extends React.Component {
  constructor(props) {
    super(props)
    this.dom = null
    this.instance = null
    this.state = {
      // visible: false,
      // selectColle: '',
      // searchText: '',
    }
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

  shouldComponentUpdate(nextProps, nextState) {
    const {
      graph, forcename, resize,
    } = nextProps
    if (!_.isEqual(nextState, this.nextState)) {
      return true
    }
    return !_.isEqual(graph, this.props.graph)
      || forcename !== this.props.forcename
      || !_.isEqual(resize, this.props.resize)
  }

  componentDidUpdate() {
    const { graph, forcename } = this.props
    this.instance = this.renderChart(this.dom, graph, forcename, this.instance)
  }

  componentWillUnmount() {
    unbind(this.dom)
    this.instance && this.instance.dispose()  //  eslint-disable-line
  }

  // openOrFold = (param, graph) => {
  //   if (param.data.isTable === true) {
  //     this.setState({ visible: true, selectColle: param.data.oriName })
  //     return
  //   }
  //   const { name, category, open } = param.data
  //   if (category !== '1') {
  //     return
  //   }
  //   const { nodes, links } = graph
  //   const newNodes = nodes
  //   if (open === true) {
  //     if (_.find(newNodes, { name }) !== undefined) {
  //       _.find(newNodes, { name }).open = false
  //       links.forEach((e) => {
  //         if (e.target === name) {
  //           _.find(newNodes, { name: e.source }).show = false
  //         }
  //       })
  //     }
  //   } else if (_.find(newNodes, { name }) !== undefined) {
  //     _.find(newNodes, { name }).open = true
  //     links.forEach((e) => {
  //       if (e.target === name) {
  //         _.find(newNodes, { name: e.source }).show = true
  //       }
  //     })
  //   }
  //   this.renderChart(this.dom, { nodes: newNodes, links }, this.props.forcename, this.instance)
  // }

  jumpToGraph = (param) => {
    const { data } = param
    const { category, uri, name } = data
    if (category === '0') {
      return
    }
    if (category !== '1') {
      this.props.handleExpandGraph({
        uri,
        name,
      })
    }
    // this.setState({ visible: false, searchText: '', selectColle: '' })
  }

  // newJumpToGraph = (param) => {
  //   this.props.handleExpandGraph({
  //     uri: param.subject,
  //     name: param.subject_label,
  //   })
  // this.setState({ visible: false, searchText: '', selectColle: '' })
  // }

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

  handleTableData = (selectColle, searchText) => {
    if (this.props.graph.tableResult && selectColle !== '') {
      if (this.props.graph.tableResult[selectColle]) {
        const newData = this.props.graph.tableResult[selectColle].filter((e) => {
          return e.subject_label !== undefined
        }).filter((e) => {
          return e.subject_label.indexOf(searchText) > -1
        })
        return _.uniqBy(newData, 'subject_label')
      }
    } else {
      return []
    }
  }

  renderChart = (dom, graph, forcename, instance, forceUpdate = false) => {
    let options
    const that = this
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
      const { nodes } = graph
      const categories = []
      nodes.forEach((e) => {
        if (e.colle && !_.find(categories, { name: e.colle })) {
          categories.push({
            name: e.colle,
          })
        }
      })
      graph.links.forEach((e) => {
        const countList = graph.links.filter((j) => {
          return j.source === e.source
        })
        const count = countList.length
        const number = _.findIndex(countList, { source: e.source, colle: e.colle })
        e.lineStyle = {
          color: 'source',
          curveness: number / count,
        }
      })
      if (this.props.newClassGraph) {
        nodes.forEach((e) => {
          if (e.name === forcename) {
            e.symbolSize = 60
            e.category = '2'
            e.label.normal.textStyle = {
              color: '#000000',
              fontWeight: '700',
              fontSize: '16',
            }
          } else {
            e.symbolSize = 20
            e.category = '2'
            e.label.normal.textStyle = {
              color: '#000000',
              fontWeight: 'normal',
              fontSize: '12',
            }
          }
        })
      }
      options = {
        title: {
          text: `${this.props.forcename} 的关系图`,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        series: [{
          type: 'graph',
          layout: 'force',
          focusNodeAdjacency: true,
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          name: forcename,
          roam: true,
          gravity: 1,
          tooltip: {
            trigger: 'item',
            textStyle: {
              fontSize: 12,
            },
          },
          force: {
            initLayout: 'circular',
            repulsion: 50,
            gravity: 0.01,
            edgeLength: 200,
            layoutAnimation: true,
          },
          linkSymbol: 'arrow',
          categories: [
            {
              name: '0',
              itemStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                    offset: 0,
                    color: '#ca1001',
                  }, {
                    offset: 1,
                    color: '#ff8980',
                  }]),
                },
              },
            },
            ...categories,
          ],
          emphasis: {
            lineStyle: {
              width: 5,
            },
          },
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
    else myChart = echarts.init(dom, 'light')
    myChart.clear()
    myChart.resize()
    myChart.setOption(options)
    if (myChart._$handlers.click) { // eslint-disable-line
      myChart._$handlers.click.length = 0 // eslint-disable-line
    // } if (myChart._$handlers.dblclick) { // eslint-disable-line
    //   myChart._$handlers.dblclick.length = 0 // eslint-disable-line
    }
    myChart.on('click', (params) => {
      that.jumpToGraph(params)
    })
    // myChart.on('dblclick', (params) => {
    //   that.openOrFold(params, graph)
    // })
    myChart.setOption(options)
    return myChart
  }

  render() {
    // const { visible, selectColle, searchText } = this.state
    // const columns = [{
    //   title: '关联知识点',
    //   dataIndex: 'subject_label',
    //   render: (text, record) => {
    //     return <a style={{ fontWeight: 700 }} href="javascript:;" onClick={() => this.newJumpToGraph(record)}>{text}</a>
    //   },
    // }, {
    //   title: '关系',
    //   dataIndex: 'predicate_label',
    // }, {
    //   title: '当前知识点',
    //   render: () => {
    //     return <span>{this.props.forcename}</span>
    //   },
    // }]
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {/* <Modal
          title={`[${selectColle}] [${this.props.forcename}] 的知识点`}
          visible={visible}
          footer={null}
          onOk={() => this.setState({ visible: false })}
          onCancel={() => this.setState({ visible: false })}
        >
          <div style={{ height: 30, marginBottom: 10 }}>
            <Search
              size="small"
              onSearch={(value) => {
                this.setState({ searchText: value })
              }}
            />
          </div>
          <Table
            columns={columns}
            dataSource={this.handleTableData(selectColle, searchText)}
            size="small"
          />
        </Modal> */}
        <div className="e-charts-graph" ref={(t) => this.dom = t} style={{ height: '100%', width: '100%' }} />
      </div>
    )
  }
}
