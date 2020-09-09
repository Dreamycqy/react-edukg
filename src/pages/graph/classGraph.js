import React from 'react'
import { Card, Spin, Table, List, Icon, Cascader, Input, Button, Anchor, Modal } from 'antd'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import _ from 'lodash'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { getUrlParams } from '@/utils/common'
import Chart from '@/components/charts/graph'
import { newResult } from '@/services/edukg'
import GrapeImg from '@/assets/grape.png'
import Styles from './style.less'

const { Link } = Anchor
const test = /^[A-Za-z]+$/i

const columns = [{
  title: '标签',
  dataIndex: 'predicate_label',
  width: 150,
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
    const typeNew = record.predicate ? record.predicate.split('#')[1] : ''
    if (typeNew === 'image' || record.object.indexOf('getjpg') > -1 || record.object.indexOf('getpng') > -1) {
      return <img style={{ maxHeight: 300 }} alt="" src={record.object} />
    } else if (typeNew === 'category' || (record.object.indexOf('http') > -1 && record.object_label.length > 0)) {
      return <span style={{ color: '#24b0e6' }}>{record.object_label}</span>
    } else {
      return <span style={{ color: '#24b0e6' }}>{record.object}</span>
    }
  },
}]

const columnsResource = [{
  title: '标题',
  dataIndex: 'object_label',
}]

const options = [{
  value: 'score',
  label: '相关度',
  children: [
    {
      value: 'desc',
      label: '倒序',
    },
    {
      value: 'asc',
      label: '正序',
    },
  ],
}, {
  value: 'year',
  label: '出版时间',
  children: [
    {
      value: 'desc',
      label: '倒序',
    },
    {
      value: 'asc',
      label: '正序',
    },
  ],
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
      uri: 'http://webprotege.stanford.edu/R816WDEyFZ6LnUcUbMsDuzR',
      filter: ['score', 'desc'],
      searchKey: '',
      imgList: [],
      wikiLinks: {},
      selectImg: {
        src: '',
        index: 1,
      },
      modalVisible: false,
      graphHistory: [],
      selectGraph: {
        uri: 'http://webprotege.stanford.edu/R816WDEyFZ6LnUcUbMsDuzR',
        name: '科学',
      },
      type: '概念',
      kgLarger: false,
    }
  }

  componentWillMount() {
    this.getChart()
  }

  getChart = async () => {
    this.setState({ loading: true })
    const { uri, graphHistory, type } = this.state
    if (uri.length === 0) {
      this.setState({
        loading: false,
        forcename: '',
        dataSource: [],
        resource: [],
        graph: {
          nodes: [],
          links: [],
        },
      })
      return
    }
    const data = await newResult({
      uri,
    })
    if (data) {
      const { lable, propety, paper, resourcePropety, content } = data.data
      const wikiLinks = {}
      const newProperty = []
      if (graphHistory.length === 0) {
        graphHistory.push({
          name: lable,
          uri,
          type,
        })
      }
      const params = this.remakeGraphData(content, lable, type)
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
          draggable: true,
          type: e.type,
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
        params.links.push({
          source: e.name,
          target: graphHistory[index - 1] ? graphHistory[index - 1].name : null,
        })
      })
      if (resourcePropety) {
        propety.forEach((e) => {
          const target = _.filter(resourcePropety, { resourceuri: e.object })
          if (target.length > 0) {
            if (!wikiLinks[e.predicate_label]) {
              wikiLinks[e.predicate_label] = []
            }
            const item = {
              ...e,
              propety: target,
            }
            wikiLinks[e.predicate_label].push(item)
          } else {
            newProperty.push(e)
          }
        })
      }
      this.setState({
        forcename: lable,
        dataSource: propety ? this.handleData(newProperty) : [],
        resource: paper ? paper.data[0].items : [],
        wikiLinks,
        graphHistory,
        graph: {
          nodes: params.nodes,
          links: params.links,
        },
      })
    }
    this.setState({ loading: false })
  }

  remakeGraphData = (list, forcename, type) => {
    window.location.href = '#components-anchor-graph'
    const nodes = []
    const links = []
    const temp = {}
    list.forEach((e) => {
      if (!e.predicate_label) {
        e.predicate_label = type === 'class' ? '概念' : '实体'
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
        temp[colle].forEach((e) => {
          nodes.push({
            name: e.object_label || e.subject_label,
            category: '2', // 叶子节点
            symbolSize: 16, // 节点大小
            uri: e.object || e.subject,
            show: false,
            symbol: 'circle',
            draggable: true,
            type,
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
        temp[colle].forEach((e) => {
          nodes.push({
            name: e.object_label || e.subject_label,
            category: '2', // 叶子节点
            symbolSize: 16, // 节点大小
            uri: e.object || e.subject,
            show: false,
            symbol: 'circle',
            draggable: true,
            type,
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
      if (e.predicate_label && e.predicate_label !== '学术论文') {
        if (e.type === 'image' || e.object.indexOf('getjpg') > 0 || e.object.indexOf('getpng') > 0) {
          imgList.push(e)
        } else {
          result.push(e)
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
    await this.setState({ selectGraph: target, uri: target.uri, type: target.type })
    this.getChart()
  }

  handleAnchor = (wiki) => {
    const result = []
    for (const listName in wiki) { // eslint-disable-line
      result.push(<Link href={`#${listName}`} style={{ margin: 10 }} title={listName} />)
    }
    return result
  }

  renderImg = (list) => {
    const result = []
    const { imgList } = this.state
    list.forEach((e) => {
      result.push(
        <div>
          <a href="javascript:;" onClick={() => this.chooseImg(_.findIndex(imgList, { object: e.object }))}>
            <img style={{ border: '1px solid #e8e8e8', margin: 10 }} src={e.object} alt="" height="220px" width="220px" />
          </a>
        </div>,
      )
    })
    return result
  }

  chooseImg = (num) => {
    const { imgList } = this.state
    this.setState({
      modalVisible: true,
      selectImg: {
        index: num,
        src: imgList[num].object,
      },
    })
  }

  renderCard = (list) => {
    const result = []
    for (const obj in list) { // eslint-disable-line
      result.push(
        <Card className={Styles.myCard} id={obj} style={{ margin: 10 }} title={obj}>
          <Table
            columns={columnsResource}
            size="small"
            className={Styles.myTable}
            showHeader={false}
            pagination={false}
            expandedRowRender={record => (
              <div style={{ margin: 0 }}>
                {this.renderExpand(record.propety)}
              </div>
            )}
            dataSource={list[obj]}
          />
        </Card>,
      )
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
                : <span>{e.object}</span>
            }
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
      forcename, dataSource, loading, resource, filter, searchKey, kgLarger,
      imgList, wikiLinks, selectImg, modalVisible, graph, type, graphHistory,
    } = this.state
    return (
      <div style={{ paddingTop: 10, overflow: 'hidden', minWidth: 1300, backgroundColor: '#ffffffe9' }}>
        <div style={{ height: 80, margin: '10px 0 0 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block' }}>
            <div style={{ height: 60, marginLeft: 30, marginTop: 6, float: 'left' }}>
              <img style={{ float: 'left' }} src={GrapeImg} alt="" height="60px" />
              <div style={{ fontSize: 38, float: 'left', color: '#6e72df', fontWeight: 700 }}>SEKG</div>
            </div>
            <Input
              value={searchKey}
              onChange={e => this.setState({ searchKey: e.target.value })}
              onPressEnter={e => this.handleJump(e.target.value)}
              placeholder="请输入科学教育相关知识点"
              style={{
                borderBottomRightRadius: 0,
                borderTopRightRadius: 0,
                width: 520,
                height: 50,
                lineHeight: '50px',
                fontSize: 24,
                float: 'left',
                marginTop: 10,
                marginLeft: 20,
              }}
            />
            <Button
              style={{
                float: 'left',
                height: 50,
                width: 180,
                marginTop: 10,
                borderBottomLeftRadius: 0,
                borderTopLeftRadius: 0,
              }}
              type="primary" size="large"
              onClick={() => this.handleJump(searchKey)}
            >
              搜索
            </Button>
          </div>
        </div>
        <div style={{ float: 'left', width: '60%', padding: 10 }}>
          <Card
            className={Styles.myCard}
            id="components-anchor-graph"
            title={(<div style={{ fontSize: 20, fontWeight: 700 }}>
              <span
                style={{
                  color: 'white',
                  padding: '2px 20px',
                  display: 'inline-block',
                  textAlign: 'center',
                  border: '1px solid',
                  backgroundColor: type === 'instance' ? '#24b0e6' : '#28d100',
                  borderColor: type === 'instance' ? '#24b0e6' : '#28d100',
                  borderRadius: 4,
                  marginRight: 12,
                }}
              >
                {type === 'instance' ? '实体' : '概念'}
              </span>
              <span style={{ color: '#24b0e6' }}>{forcename}</span>
            </div>)}
          >
            <Spin spinning={loading}>
              <div style={{ float: 'left', width: 200, borderRight: '1px solid #e8e8e8', height: 600, overflowY: 'scroll' }}>
                {graphHistory.map((e, index) => (
                  <div style={{ padding: 6 }}>
                    <a
                      href="javascript:;" style={{ margin: 10, color: index === graphHistory.length - 1 ? '#24b0e6' : '#888' }}
                      onClick={() => this.handleExpandGraph(e)}
                    >
                      {index === graphHistory.length - 1
                        ? <Icon theme="filled" type="right-circle" style={{ marginRight: 10 }} />
                        : <div style={{ width: 24, display: 'inline-block' }} />
                      }
                      {e.name}
                    </a>
                  </div>
                ))}
              </div>
              <div style={{ height: 600, overflow: 'hidden' }}>
                <Chart
                  graph={graph} forcename={forcename}
                  handleExpandGraph={this.handleExpandGraph}
                />
              </div>
            </Spin>
          </Card>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div>
            <Card className={Styles.myCard} id="components-anchor-props" style={{ display: dataSource.length === 0 ? 'none' : 'block', margin: 10 }} bordered={false}>
              <Table
                dataSource={dataSource}
                columns={columns}
                loading={loading}
                size="small"
                className={Styles.myTable}
                showHeader={false}
                pagination={false}
                rowKey={record => record.propertyname}
              />
            </Card>
            <Card className={Styles.myCard} style={{ display: imgList.length === 0 ? 'none' : 'block', margin: 10 }} id="components-anchor-pics" title="相关图片">
              <Spin spinning={loading}>
                <div style={{ height: 280 }}>
                  <Slider
                    style={{ height: 260, backgroundColor: 'aliceblue' }}
                    dots slidesPerRow={4}
                    autoplay autoplaySpeed={3000}
                  >
                    {this.renderImg(imgList)}
                  </Slider>
                </div>
              </Spin>
            </Card>
            {this.renderCard(wikiLinks)}
            <Card
              className={Styles.myCard}
              style={{ margin: 10 }}
              title="相关论文"
              id="components-anchor-pages"
              extra={(
                <Cascader
                  options={options}
                  value={filter}
                  rows={4}
                  onChange={value => this.setState({ filter: value })}
                  allowClear={false}
                />
              )}
            >
              <List
                itemLayout="vertical"
                size="large"
                dataSource={_.orderBy(resource, filter[0], filter[1])}
                loading={loading}
                pagination={{
                  showSizeChanger: false,
                  size: 'small',
                  style: { display: typeof resource === 'object' && resource.length > 0 ? 'block' : 'none' },
                }}
                style={{ height: 600, overflowY: 'scroll', padding: '0 20px 20px 20px' }}
                renderItem={(item) => {
                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={(
                          <a
                            href="javascript:;"
                            onClick={() => { window.open(`https://www.aminer.cn/pub/${item.id}`) }}
                          >
                            { item.title_zh ? <span>{item.title_zh}</span> : null }
                            { item.title_zh ? <br /> : null }
                            { item.title ? <span>{item.title}</span> : null }
                          </a>
                        )}
                        description={(
                          <div>
                            <Icon
                              type="read"
                              style={{ marginRight: 8, color: '#24b0e6' }}
                            />
                            出版期刊：
                            {!item.venue ? '未知'
                              : !item.venue.info ? '未知'
                                : !item.venue.info.name_zh ? '未知'
                                  : item.venue.info.name_zh.length === 0 ? '未知'
                                    : item.venue.info.name
                                      ? item.venue.info.name : '未知'
                            }
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <Icon
                              type="clock-circle"
                              style={{ marginRight: 8, color: '#24b0e6' }}
                            />
                            出版时期：
                            {item.year ? `${item.year}年` : '未知年份'}
                            {item.venue ? `    第${item.venue.issue}期` : '    未知期数'}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          </div>
                        )}
                      />
                      <div>
                        {/* <div style={{ color: '#00000073' }}>
                          <Icon
                            type="diff"
                            style={{ marginRight: 8, color: '#24b0e6' }}
                          />
                          相关度：
                          <span style={{ color: 'red' }}>{item.score}</span>
                        </div> */}
                        <div style={{ marginTop: 10, color: '#00000073' }}>
                          <Icon
                            type="user"
                            style={{ marginRight: 8, color: '#24b0e6' }}
                          />
                          作者：
                          {
                            item.authors
                              ? item.authors.length > 0 ? item.authors.map((e) => {
                                return (
                                  <span style={{ marginRight: 10 }}>
                                    {e.name_zh ? e.name_zh : e.name}
                                  </span>
                                )
                              })
                                : <span>未知作者</span> : <span>未知作者</span>
                          }
                        </div>
                        <div style={{ marginTop: 10, color: '#00000073' }}>
                          <Icon
                            type="tags"
                            style={{ marginRight: 8, color: '#24b0e6' }}
                          />
                          关键词：
                          {
                            item.keywords
                              ? <span>{item.keywords.join(', ')}</span>
                              : null
                          }
                        </div>
                        <div style={{ marginTop: 10 }}>{item.abstract}</div>
                        <div style={{ marginTop: 10 }}>{item.abstract_zh}</div>
                      </div>
                    </List.Item>
                  )
                }}
              />
            </Card>
          </div>
        </div>
        <div style={{ position: 'fixed', width: '100%', height: '100%', top: 0, zIndex: 998, display: kgLarger === true ? 'block' : 'none', backgroundColor: 'rgba(0, 0, 0, 0.65)' }} />
        <Modal
          title="相关图片"
          visible={modalVisible}
          footer={null}
          width="1000px"
          onCancel={() => this.setState({ modalVisible: false })}
        >
          <div style={{ marginTop: 20 }}>
            <div style={{ textAlign: 'center', minHeight: 320 }}>
              <img src={selectImg.src} alt="" style={{ maxHeight: 300 }} />
            </div>
            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <Button type="primary" style={{ marginRight: 20 }} disabled={selectImg.index === 0} onClick={() => this.chooseImg(selectImg.index - 1)}>前一张</Button>
              <span>
                第&nbsp;
                {selectImg.index + 1}
                &nbsp;
                /
                &nbsp;
                {imgList.length}
                &nbsp;张
              </span>
              <Button type="primary" style={{ marginLeft: 20 }} disabled={selectImg.index === imgList.length - 1} onClick={() => this.chooseImg(selectImg.index + 1)}>后一张</Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default FirstGraph
