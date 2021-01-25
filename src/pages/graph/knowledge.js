import React from 'react'
import { Anchor, Spin, Icon, Tabs } from 'antd'
import _ from 'lodash'
import Script from 'react-load-script'
import { getUrlParams } from '@/utils/common'
import { infoByInstanceName } from '@/services/knowledge'
import { remakeGraphData } from '@/utils/graphData'
import GrapeImg from '@/assets/grape.png'
import edu10086 from '@/assets/edu10086.png'
import Chart from '@/components/charts/graph'
import Think from './think'
import GCard from './components/graphCard'
import NewCard from './components/localCard'
import KgTable from './components/kgTable'
import Gallery from './components/gallery'
import Questions from './question'
import Styles from './style.less'

const { Link } = Anchor
const { TabPane } = Tabs
const test = /^[A-Za-z]+$/i
const deleteList = ['学术论文', '标注', '出处', '分类编号', '上位分类', '下位分类', '科普中国资源', '科普活动资源服务平台-科普资源', '科普活动资源服务平台-活动资源', '科学百科词条', '中国科普博览']

class KgContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      forcename: unescape(getUrlParams().name || ''),
      subject: getUrlParams().subject || 'chinese',
      dataSource: [],
      imgList: [],
      graphHistory: [],
      selectGraph: {
        name: unescape(getUrlParams().name || ''),
      },
      graph: {
        nodes: [],
        links: [],
      },
      thinkData: [],
      selectChart: 'relation',
      liveClassRoom: '',
    }
  }

  UNSAFE_componentWillMount = async () => {
    await this.getChart()
  }

  onhandleScript = (sign) => {
    if (sign === 'load') {
      this.setState({ thinkData: window.sheet })
    }
  }

  getChart = async () => {
    this.setState({ loading: true })
    const { forcename, subject, graphHistory } = this.state
    if (forcename.length === 0) {
      this.setState({
        loading: false,
        forcename: '',
        dataSource: [],
        graph: {
          nodes: [],
          links: [],
        },
      })
      return
    }
    const data = await infoByInstanceName({
      name: forcename,
      subject,
    })
    if (data) {
      const { label, property, content } = data.data
      if (graphHistory.length === 0) {
        graphHistory.push({
          name: label,
          uri: '',
        })
      }
      const params = remakeGraphData(content, label, 'instance')
      graphHistory.forEach((e, index) => {
        if (index < graphHistory.length - 1) {
          params.nodes = params.nodes.filter((j) => { return j.name !== e.name })
        } else {
          params.nodes = params.nodes.filter((j) => { return !(j.name === e.name && j.category === '2') })
        }
        params.links = params.links.filter((j) => { return j.source !== e.name })
        params.nodes.push({
          name: e.name,
          category: index === graphHistory.length - 1 ? '0' : '3', // 历史节点
          symbolSize: index === graphHistory.length - 1 ? 60 : 40, // 节点大小
          uri: e.uri,
          symbol: 'circle',
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          draggable: true,
          label: {
            normal: {
              show: true,
              position: 'bottom',
              formatter: (val) => {
                const strs = val.data.name.replace(' ', '\n').split('')
                let str = ''
                for (let j = 0, s; s = strs[j++];) {
                  str += s
                  if (!(j % 8) && !test.test(s)) str += '\n'
                }
                return str
              },
              textStyle: {
                color: '#000000',
                fontWeight: 'normal',
                fontSize: '12',
              },
            },
          },
        })
        if (graphHistory[index - 1]) {
          params.links.push({
            source: e.name,
            target: graphHistory[index - 1].name,
          })
        }
      })
      this.setState({
        dataSource: property ? this.handleData(property) : [],
        graph: params,
      })
    }
    this.setState({ loading: false })
  }

  handleData = (array) => {
    const result = []
    const imgList = []
    array.forEach((e) => {
      if (e.predicateLabel && deleteList.indexOf(e.predicateLabel) < 0) {
        if (e.predicateLabel.indexOf('中移动直播课网址') > -1) {
          this.setState({ liveClassRoom: e.object })
          return
        }
        if (e.object.indexOf('getjpg') > 0 || e.object.indexOf('getpng') > 0) {
          imgList.push(e)
        } else {
          const target = _.find(result, { predicateLabel: e.predicateLabel })
          const text = e.objectLabel ? e.objectLabel : e.object
          if (!target) {
            result.push({
              ...e,
              labelList: [text],
            })
          } else {
            target.labelList.push(text)
          }
        }
      }
    })
    this.setState({ imgList })
    return result
  }

  handleAnchor = (e) => {
    e.preventDefault()
  }

  handleTitle = (title) => {
    switch (title) {
      case 'graph':
        return '知识地图'
      case 'property':
        return '知识卡片'
      case 'picture':
        return '相关图片'
      case 'video':
        return '教学视频'
      case 'question':
        return '相关习题'
      default:
        return ''
    }
  }

  handleSelectChart = (selectChart) => {
    this.setState({ selectChart })
  }

  handleConcat = (list) => {
    const transSource = []
    const sheetDataFilter = ['知识点', '知识内容']
    const sheetDataHeader = ['知识点', '知识内容']
    list.forEach((e) => {
      if (e.labelList) {
        transSource.push({
          知识点: e.predicateLabel,
          知识内容: e.labelList.filter((j) => { return j.indexOf('http') < 0 }).join(', '),
        })
      } else {
        transSource.push({
          知识点: e.predicateLabel,
          知识内容: e.object,
        })
      }
    })
    return { transSource, sheetDataFilter, sheetDataHeader }
  }

  handleExpandGraph = async (target) => {
    const { graphHistory, selectGraph } = this.state
    const num = _.findIndex(graphHistory, { name: target.name })
    if (num > -1) {
      this.setState({ graphHistory: graphHistory.splice(0, num + 1) })
    } else {
      this.setState({
        graphHistory: [...graphHistory, {
          ...target,
          target: selectGraph.name,
        }],
      })
    }
    await this.setState({ selectGraph: target, forcename: target.name })
    this.getChart()
  }

  handleVideo = (url, subject) => {
    return (
      <div style={{ padding: 10 }}>
        <a href={url.length === 0 ? 'http://edu.10086.cn/cloud/liveClassroom/redirectLive?type=live_Index' : url} target="_blank">
          <img src={edu10086} height="240px" width="360px" alt="" />
          <p style={{ width: 360, textAlign: 'center', fontSize: 16, marginTop: 6 }}>和教育直播课</p>
        </a>
      </div>
    )
  }

  handleRelation = (graph) => {
    const result = []
    _.uniqBy(graph.nodes, 'name').filter((e) => { return e.name.indexOf('实体') < 0 }).forEach((e, index) => {
      if (e.category !== '2' || index > 20) {
        return
      }
      result.push(
        <div style={{ padding: 6 }}>
          <a
            href="javascript:;" style={{ margin: 10, color: '#24b0e6' }}
            onClick={() => this.handleExpandGraph(e)}
          >
            <Icon theme="filled" type="right-circle" style={{ marginRight: 10 }} />
            {e.name}
          </a>
        </div>,
      )
    })
    for (const i in graph.tableResult) { // eslint-disable-line
      _.uniqBy(graph.tableResult[i], 'subject_label').forEach((e) => {
        if (result.length <= 20) {
          result.push(
            <div style={{ padding: 6 }}>
              <a
                href="javascript:;" style={{ margin: 10, color: '#24b0e6' }}
                onClick={() => this.handleExpandGraph({
                  name: e.subject_label,
                  uri: e.subject,
                })}
              >
                <Icon theme="filled" type="right-circle" style={{ marginRight: 10 }} />
                {e.subject_label}
              </a>
            </div>,
          )
        }
      })
    }
    return result
  }

  renderAnchor = (list) => {
    const result = []
    for (const title of list) {
      result.push(<Link href={`#anchor_${title}`} style={{ margin: 10 }} title={this.handleTitle(title)} />)
    }
    return result
  }

  render() {
    const anchorList = ['graph', 'property', 'video']
    const {
      forcename, loading, graph, dataSource, imgList,
      subject, thinkData, graphHistory, selectChart, liveClassRoom,
    } = this.state
    if (imgList.length > 0) {
      anchorList.push('picture')
    }
    anchorList.push('question')
    const { transSource, sheetDataFilter, sheetDataHeader } = this.handleConcat(dataSource)
    const dataConfig = {
      title: forcename,
      dataSource: transSource,
      sheetDataFilter,
      sheetDataHeader,
    }
    return (
      <div style={{ minWidth: 1300, backgroundColor: '#f2f6f7e6' }}>
        <Script
          url="http://39.97.172.123:3000/cmcc/data.js"
          onCreate={() => this.onhandleScript('create')}
          onError={() => this.onhandleScript('error')}
          onLoad={() => this.onhandleScript('load')}
        />
        <div style={{ float: 'left', width: 250 }}>
          <div style={{ height: 60, marginLeft: 30, marginTop: 6 }}>
            <img style={{ float: 'left' }} src={GrapeImg} alt="" height="60px" />
            <div style={{ fontSize: 32, float: 'left', color: '#6e72df', fontWeight: 700, marginTop: 6 }}>知识维基</div>
          </div>
          <Anchor onClick={this.handleAnchor} className={Styles.anchor}>
            {this.renderAnchor(anchorList)}
          </Anchor>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <Spin spinning={loading}>
            <GCard show title="graph" selectChart={selectChart} onSelect={this.handleSelectChart}>
              {selectChart === 'relation'
                ? (
                  <div style={{ height: 450 }}>
                    <div style={{ float: 'left', width: 240, borderRight: '1px solid #e8e8e8', height: '100%' }}>
                      <Tabs>
                        <TabPane tab="关联知识" key="2" style={{ height: 420 }}>
                          <div style={{ height: '100%', overflowY: 'scroll' }}>
                            {this.handleRelation(graph)}
                          </div>
                        </TabPane>
                        <TabPane tab="访问历史" key="1" style={{ height: 420 }}>
                          <div style={{ height: '100%', overflowY: 'scroll' }}>
                            {graphHistory.map((e, index) => (
                              <div style={{ padding: 6 }}>
                                <a
                                  href="javascript:;" style={{ margin: 10, color: index === graphHistory.length - 1 ? '#24b0e6' : '#888' }}
                                  onClick={() => this.handleExpandGraph(e)}
                                >
                                  {index === graphHistory.length - 1
                                    ? <Icon theme="filled" type="right-circle" style={{ marginRight: 10 }} />
                                    : <div style={{ width: 24, display: 'inline-block' }} />}
                                  {e.name}
                                </a>
                              </div>
                            ))}
                          </div>
                        </TabPane>
                      </Tabs>
                    </div>
                    <div style={{ height: '100%', width: 'auto', overflow: 'hidden' }}>
                      <Chart
                        graph={graph} forcename={forcename}
                        handleExpandGraph={this.handleExpandGraph}
                      />
                    </div>
                  </div>
                ) : <div />}
              {
                selectChart === 'relation' ? <div /> : (
                  <Think
                    graph={thinkData}
                    forcename={forcename}
                    subject={subject}
                    select={dataSource}
                  />
                )
              }
            </GCard>
            <NewCard show showExtra dataConfig={dataConfig} title="property">
              <KgTable dataSource={dataSource} />
            </NewCard>
            <NewCard show title="video">
              <div style={{ height: 280 }}>
                {this.handleVideo(liveClassRoom, subject)}
              </div>
            </NewCard>
            <NewCard show={imgList.length > 0} title="picture">
              <Gallery imgList={imgList} />
            </NewCard>
            <NewCard show title="question">
              <Questions uri={forcename} />
            </NewCard>
          </Spin>
        </div>
      </div>
    )
  }
}
export default KgContent
