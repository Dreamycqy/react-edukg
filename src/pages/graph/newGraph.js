import React from 'react'
import { Card, Spin, Table, Icon, Input, Button, Anchor, Popover } from 'antd'
import _ from 'lodash'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import Script from 'react-load-script'
import { getUrlParams } from '@/utils/common'
import Chart from '@/components/charts/graph'
import { infoByInstanceName } from '@/services/knowledge'
import subList from '@/constants/subject'
import Think from './think'
import Gallery from './components/gallery'
import Questions from './question'
import Styles from './style.less'

const { Link } = Anchor
const ButtonGroup = Button.Group
const test = /^[A-Za-z]+$/i

const columns = [{
  title: '标签',
  dataIndex: 'predicateLabel',
  width: 100,
  align: 'left',
  render: (text) => {
    return <span style={{ fontWeight: 700 }}>{text}</span>
  },
}, {
  title: 'none',
  width: 10,
}, {
  title: '内容',
  align: 'left',
  render: (text, record) => {
    if (record.labelList) {
      return <span style={{ color: '#24afe6' }}>{record.labelList.filter((e) => { return e.indexOf('http') < 0 }).join('， ')}</span>
    } else {
      return <span style={{ color: '#24afe6' }}>{record.object}</span>
    }
  },
}]

@connect()
class FirstGraph extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      graph: {
        nodes: [],
        links: [],
      },
      forcename: '',
      dataSource: [],
      loading: false,
      name: unescape(getUrlParams().name || ''),
      searchKey: '',
      imgList: [],
      graphHistory: [],
      selectGraph: {
        name: unescape(getUrlParams().name || ''),
      },
      kgLarger: false,
      showRelation: true,
      subject: getUrlParams().subject || 'chinese',
      thinkData: [],
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
    const { name, graphHistory, subject } = this.state
    if (name.length === 0) {
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
      name,
      subject,
    })
    if (data) {
      const { label, property, content } = data.data
      if (graphHistory.length === 0) {
        graphHistory.push({
          name: label,
        })
      }
      const params = this.remakeGraphData(content, label, 'instance')
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
        forcename: label,
        dataSource: property ? this.handleData(property) : [],
        graphHistory,
        graph: {
          nodes: params.nodes,
          links: params.links,
        },
      })
    }
    this.setState({ loading: false })
  }

  remakeGraphData = (list, forcename) => {
    window.location.href = '#components-anchor-graph'
    const nodes = []
    const links = []
    const temp = {}
    list.forEach((e) => {
      if (!e.predicate_label) {
        e.predicate_label = '实体'
      }
      if (!temp[e.predicate_label]) {
        temp[e.predicate_label] = []
      }
      temp[e.predicate_label].push(e)
    })
    for (const colle in temp) { // eslint-disable-line
      if (temp[colle].length > 2) {
        nodes.push({
          name: `${colle} (集)`,
          category: '1', // 二级父节点
          symbolSize: 36, // 节点大小
          uri: '',
          open: false,
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
        links.push({
          source: `${colle} (集)`,
          target: forcename,
        })
        temp[colle].forEach((e) => { // eslint-disable-line
          nodes.push({
            name: e.object_label || e.subject_label,
            category: '2', // 叶子节点
            symbolSize: 16, // 节点大小
            uri: e.object || e.subject,
            showLeaf: false,
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
          links.push({
            source: e.object_label || e.subject_label,
            target: `${colle} (集)`,
          })
        })
      } else {
        temp[colle].forEach((e) => { // eslint-disable-line
          nodes.push({
            name: e.object_label || e.subject_label,
            category: '2', // 叶子节点
            symbolSize: 16, // 节点大小
            uri: e.object || e.subject,
            showLeaf: false,
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
          links.push({
            source: e.object_label || e.subject_label,
            target: forcename,
          })
        })
      }
    }
    return { nodes, links }
  }

  handleData = (array) => {
    const result = []
    const imgList = []
    array.forEach((e) => {
      if (e.predicateLabel && e.predicateLabel !== '学术论文' && e.predicateLabel !== '标注' && e.predicateLabel !== '出处') {
        if (e.type === 'image' || e.object.indexOf('getjpg') > 0 || e.object.indexOf('getpng') > 0) {
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

  handleClick = (e) => {
    e.preventDefault()
  }

  handleJump = (filter) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/searchPage',
      query: {
        filter,
      },
    }))
  }

  handleExpandGraph = async (target) => {
    const { graphHistory, selectGraph } = this.state
    const num = _.findIndex(graphHistory, { uri: target.uri })
    if (num > -1) {
      this.setState({ graphHistory: graphHistory.splice(0, num + 1) })
    } else {
      this.setState({
        graphHistory: [...graphHistory, {
          ...target,
          target: selectGraph.uri,
        }],
      })
    }
    await this.setState({ selectGraph: target, uri: target.uri })
    this.getChart()
  }

  handleAnchor = (wiki) => {
    const result = []
    for (const listName in wiki) { // eslint-disable-line
      result.push(<Link href={`#${listName}`} style={{ margin: 10 }} title={listName} />)
    }
    return result
  }

  renderExpand = (objList) => {
    const result = []
    objList.forEach((e) => {
      result.push(
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'left', width: 150, marginRight: 10 }}>
            {e.predicate_label}
          </div>
          <div style={{ float: 'left' }}>
            {e.object.indexOf('jpg') > -1 || e.object.indexOf('png') > -1
              ? <img src={e.object} alt="" height="200px" />
              : this.checkUrl(e.object)
                ? <a href="javascript:;" onClick={() => window.open(e.object)}>{e.object}</a>
                : <span>{e.object}</span>}
          </div>
        </div>,
      )
    })
    return result
  }

  checkUrl = (text) => {
    const check = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/)
    if (check.test(text)) {
      return true
    } else {
      return false
    }
  }

  render() {
    const {
      forcename, dataSource, loading, searchKey, kgLarger, subject, thinkData,
      imgList, graph, graphHistory, showRelation,
    } = this.state
    const categoryList = dataSource.filter((e) => { return e.predicateLabel === '分类' })
    return (
      <div style={{ paddingTop: 10, overflow: 'hidden', minWidth: 1300, backgroundColor: '#f2f6f7e6' }}>
        <Script
          url="http://39.97.172.123:3000/cmcc/data.js"
          onCreate={() => this.onhandleScript('create')}
          onError={() => this.onhandleScript('error')}
          onLoad={() => this.onhandleScript('load')}
        />
        <div style={{ overflow: 'hidden' }}>
          <div>
            <div style={{ height: 80, overflow: 'hidden' }}>
              <div style={{ height: 60, margin: '10px 20px 0 0', float: 'right' }}>
                <Input
                  value={searchKey}
                  onChange={(e) => this.setState({ searchKey: e.target.value })}
                  onPressEnter={(e) => this.handleJump(e.target.value)}
                  placeholder="请输入基础教育相关知识点"
                  addonBefore={<div>{_.find(subList, { value: subject }).name}</div>}
                  style={{
                    borderBottomRightRadius: 0,
                    borderTopRightRadius: 0,
                    width: 500,
                    height: 40,
                    lineHeight: '40px',
                    fontSize: 20,
                  }}
                  size="large"
                />
                <Button
                  style={{
                    float: 'right',
                    height: 40,
                    borderBottomLeftRadius: 0,
                    borderTopLeftRadius: 0,
                  }}
                  type="primary" size="large"
                  onClick={() => this.handleJump(searchKey)}
                >
                  搜索
                </Button>
              </div>
              <div style={{ marginLeft: 30, fontSize: 20, fontWeight: 700, float: 'left', maxWidth: 600 }}>
                <span
                  style={{
                    marginTop: 10,
                    color: 'white',
                    padding: '2px 20px',
                    display: 'inline-block',
                    textAlign: 'center',
                    border: '1px solid',
                    backgroundColor: '#24b0e6',
                    borderColor: '#24b0e6',
                    borderRadius: 4,
                    marginRight: 12,
                  }}
                >
                  实体
                </span>
                <span style={{ marginRight: 12, color: '#000000a6' }}>{forcename}</span>
                <span style={{ fontSize: 14, fontWeight: 400 }}>
                  <a href="javascript:;"><Icon type="profile" /></a>
                  <span style={{ marginLeft: 10 }}>分类：</span>
                  <span>{categoryList[0] ? categoryList[0].labelList.join(' | ') : ''}</span>
                </span>
              </div>
            </div>
            <div style={{ height: 560, overflow: 'hidden' }}>
              <Card
                className={Styles.myCard}
                id="components-anchor-graph"
                title={(
                  <span style={{ color: '#fff' }}>
                    <Icon type="dot-chart" style={{ color: '#fff', marginRight: 10 }} />
                    关系图
                  </span>
                )}
                bordered={false}
                style={kgLarger === true ? { margin: 20, top: '5%', left: '5%', width: '90%', position: 'fixed', zIndex: 999 } : { margin: 20, float: 'left', width: '65%' }}
                extra={(
                  <div>
                    <Popover
                      content={(
                        <div style={{ width: 400 }}>
                          关系图：双击蓝色集合节点展开同分类的子节点，单击子节点选中并查看对应词条，关系图随之延伸。左侧目录记录节点访问路径。
                        </div>
                      )}
                      title="说明"
                    >
                      <a style={{ marginRight: 20, fontSize: 18 }} href="javascript:;"><Icon type="question-circle" /></a>
                    </Popover>
                    <Button style={{ marginRight: 20 }} onClick={() => window.open('/kgPage?key=chinese&type=subject')}>
                      全图
                    </Button>
                    <ButtonGroup style={{ marginRight: 20 }}>
                      <Button
                        type={showRelation === true ? 'danger' : 'none'}
                        onClick={() => this.setState({ showRelation: true })}
                      >
                        关系图
                      </Button>
                      <Button
                        type={showRelation === false ? 'danger' : 'none'}
                        onClick={() => this.setState({ showRelation: false })}
                      >
                        思维导图
                      </Button>
                    </ButtonGroup>
                    <Button type="danger" onClick={() => this.setState({ kgLarger: !kgLarger })}>
                      {kgLarger === true ? '还原' : '放大'}
                    </Button>
                  </div>
                )}
              >
                <Spin spinning={loading}>
                  <div style={{ height: kgLarger === true ? 600 : 450, display: showRelation === true ? 'block' : 'none' }}>
                    <div style={{ float: 'left', width: 200, borderRight: '1px solid #e8e8e8', height: '100%', overflowY: 'scroll' }}>
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
                    <div style={{ height: kgLarger === true ? 600 : 450, width: kgLarger === true ? 1000 : 'auto', overflow: 'hidden' }}>
                      <Chart
                        graph={graph} forcename={forcename}
                        resize={{ kgLarger, showRelation }}
                        handleExpandGraph={this.handleExpandGraph}
                      />
                    </div>
                  </div>
                  <div style={{ height: kgLarger === true ? 600 : 450, display: showRelation === true ? 'none' : 'block' }}>
                    <Think
                      graph={thinkData}
                      forcename={forcename}
                      subject={subject}
                      select={dataSource}
                      resize={{ kgLarger, showRelation }}
                    />
                  </div>
                </Spin>
              </Card>
              <Card
                className={Styles.myCard}
                headStyle={{ height: 64 }}
                title={(
                  <span style={{ color: '#fff' }}>
                    <Icon type="file" style={{ color: '#fff', marginRight: 10 }} />
                    属性
                  </span>
                )}
                bordered={false}
                style={{ margin: 20, overflow: 'hidden' }}
              >
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  loading={loading}
                  size="small"
                  className={Styles.myTable}
                  showHeader={false}
                  pagination={false}
                  scroll={{ y: 450 }}
                  rowKey={(record) => record.propertyname}
                />
              </Card>
            </div>
            <Card
              className={Styles.myCard} bordered={false}
              style={{ display: imgList.length === 0 ? 'none' : 'block', margin: 20 }}
              id="components-anchor-pics" title={(
                <span style={{ color: '#fff' }}>
                  <Icon type="picture" theme="filled" style={{ color: '#fff', marginRight: 10 }} />
                  相关图片
                </span>
            )}
            >
              <Spin spinning={loading}>
                <Gallery imgList={imgList} />
              </Spin>
            </Card>
            <Card
              className={Styles.myCard} bordered={false}
              style={{ margin: 20 }}
              title={(
                <span style={{ color: '#fff' }}>
                  <Icon type="play-circle" theme="filled" style={{ color: '#fff', marginRight: 10 }} />
                  教学视频
                </span>
            )}
            >
              <Spin spinning={loading}>
                <div style={{ height: 280 }}>
                  <div style={{ padding: 10 }}>
                    <a href="http://edu.10086.cn/cloud/liveClassroom/redirectLive?type=live_detail&courseId=5230008" target="_blank">
                      <img src="https://edu.10086.cn/files/webupload//course/new/1599041949142.png" height="240px" width="360px" alt="" />
                      <p style={{ width: 360, textAlign: 'center', fontSize: 16, marginTop: 6 }}>高一地理秋季同步班</p>
                    </a>
                  </div>
                </div>
              </Spin>
            </Card>
            <Card
              className={Styles.myCard} bordered={false}
              style={{ margin: 20 }}
              title={(
                <span style={{ color: '#fff' }}>
                  <Icon type="read" theme="filled" style={{ color: '#fff', marginRight: 10 }} />
                  相关习题
                </span>
            )}
            >
              <Spin spinning={loading}>
                <Questions uri={forcename} />
              </Spin>
            </Card>
          </div>
        </div>
        <div style={{ position: 'fixed', width: '100%', height: '100%', top: 0, zIndex: 998, display: kgLarger === true ? 'block' : 'none', backgroundColor: 'rgba(0, 0, 0, 0.65)' }} />
      </div>
    )
  }
}

export default FirstGraph
