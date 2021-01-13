import React from 'react'
import { Card, Spin, Table, List, Icon, Cascader, Input, Button, Anchor, Modal, Divider, Popover } from 'antd'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import _ from 'lodash'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { getUrlParams } from '@/utils/common'
import Chart from '@/components/charts/graph'
import { infoByInstanceUri } from '@/services/knowledge'
import { getGraphBySubandGrade } from '@/services/kgApi'
import kpchinaTitle from '@/assets/kpchina_title.png'
import baiduTitle from '@/assets/baidu_title.png'
import kepuTitle from '@/assets/kepu_title.jpg'
import kpsourceTitle from '@/assets/kpsource_title.jpg'
import subList from '@/constants/subject'
import Think from './think'
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
    const typeNew = record.predicate ? record.predicate.split('#')[1] : ''
    if (typeNew === 'image' || record.object.indexOf('getjpg') > -1 || record.object.indexOf('getpng') > -1) {
      return <img style={{ maxHeight: 300 }} alt="" src={record.object} />
    } else if (typeNew === 'category' || (record.object.indexOf('http') > -1 || record.objectLabel)) {
      return <span style={{ color: '#24afe6' }}>{record.labelList.join('， ')}</span>
    } else {
      return <span style={{ color: '#24afe6' }}>{record.object}</span>
    }
  },
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
      uri: unescape(getUrlParams().uri || ''),
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
        uri: unescape(getUrlParams().uri || ''),
        name: '',
      },
      type: getUrlParams().type,
      kgLarger: false,
      showRelation: true,
      subject: getUrlParams().subject || 'chinese',
      thinkData: [],
    }
  }

  componentWillMount = async () => {
    await this.getChart()
    this.getSubKg()
  }

  getSubKg = async () => {
    const data = await getGraphBySubandGrade({
      subject: this.state.subject,
      gradeLevel: '11',
    })
    if (data) {
      const rawData = this.handleGraphData(data.data)
      const treeData = this.generateData(rawData)
      this.setState({ thinkData: treeData[0] })
    }
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
    // const data = await newResult({
    //   uri,
    // })
    const data = await infoByInstanceUri({
      uri,
    })
    if (data) {
      const { label, property, paper, content } = data.data
      const wikiLinks = {}
      const newProperty = []
      if (graphHistory.length === 0) {
        graphHistory.push({
          name: label,
          uri,
          type,
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
        if (graphHistory[index - 1]) {
          params.links.push({
            source: e.name,
            target: graphHistory[index - 1].name,
          })
        }
      })
      // if (resourceproperty) {
      //   property.forEach((e) => {
      //     const target = _.filter(resourceproperty, { resourceuri: e.object })
      //     if (target.length > 0) {
      //       if (!wikiLinks[e.predicate_label]) {
      //         wikiLinks[e.predicate_label] = []
      //       }
      //       const item = {
      //         ...e,
      //         property: target,
      //       }
      //       wikiLinks[e.predicate_label].push(item)
      //     } else {
      //       newProperty.push(e)
      //     }
      //   })
      // }
      this.setState({
        forcename: label,
        dataSource: property ? this.handleData(property) : [],
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
        temp[colle].forEach((e) => {
          nodes.push({
            name: e.object_label || e.subject_label,
            category: '2', // 叶子节点
            symbolSize: 16, // 节点大小
            uri: e.object || e.subject,
            show: true,
            symbol: 'circle',
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
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
            show: true,
            symbol: 'circle',
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
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
      if (e.predicateLabel && e.predicateLabel !== '学术论文') {
        if (e.type === 'image' || e.object.indexOf('getjpg') > 0 || e.object.indexOf('getpng') > 0) {
          imgList.push(e)
        } else {
          const target = _.find(result, { predicateLabel: e.predicateLabel })
          if (!target) {
            result.push({
              ...e,
              labelList: [e.object ? e.object : e.objectLabel],
            })
          } else {
            target.labelList.push(e.object ? e.object : e.objectLabel)
          }
        }
      }
    })
    this.setState({ imgList })
    return result
  }

  generateData = (list) => {
    const result = {}
    const startKey = []
    const newList = list || this.state.rawData
    const theName = _.find(subList, { value: this.state.subject }).name
    newList.forEach((item) => {
      if (!result[item.uri]) {
        result[item.uri] = item
      }
    })
    const map = []
    newList.forEach((item) => {
      if (item.name === theName && startKey.indexOf(item.uri) < 0) {
        startKey.push(item.uri)
      }
      if (item.target_uri) {
        if (!result[item.target_uri].children) {
          result[item.target_uri].children = []
        }
        if (!_.find(result[item.target_uri].children, { uri: item.uri })) {
          result[item.target_uri].children.push(item)
        }
      } else if (this.state.showSingle === true && item.name !== theName) {
        map.push(item)
      }
    })
    startKey.forEach((e) => {
      map.unshift(result[e])
    })
    return map
  }

  handleGraphData = (array) => {
    const result = []
    array.forEach((e) => {
      if (e.path.length > 0) {
        result.push({
          target: null,
          target_uri: null,
          name: e.path[0][e.path[0].length - 1].categoryLabel,
          uri: e.path[0][e.path[0].length - 1].category,
          type: 'class',
        })
        e.path[0].forEach((p, index) => {
          result.push({
            target_uri: p.category,
            target: p.categoryLabel,
            name: index === 0 ? e.uriName : e.path[0][index - 1].categoryLabel,
            uri: index === 0 ? e.uri : e.path[0][index - 1].category,
            type: 'class',
          })
        })
      } else {
        result.push({
          target_uri: null,
          target: null,
          name: e.uriName,
          uri: e.uri,
          type: 'instance',
        })
      }
    })
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
            <img style={{ border: '1px solid #e8e8e8', margin: 20, objectFit: 'cover' }} src={e.object} alt="" height="220px" width="220px" />
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
      let src = ''
      if (obj === '科普中国资源') {
        src = kpchinaTitle
      } else if (obj === '科学百科词条') {
        src = baiduTitle
      } else if (obj.indexOf('中国科普博览') > -1) {
        src = kepuTitle
      } else if (obj.indexOf('科普活动资源服务平台') > -1) {
        src = kpsourceTitle
      }
      result.push(
        <Card
          id={obj}
          className={Styles.myCard}
          style={{ margin: 20 }}
          title={(
            <span>
              {src.length > 0 ? <img alt="" src={src} height="30px" width="100px" /> : null}
              &nbsp;&nbsp;&nbsp;&nbsp;
              {obj}
            </span>
          )}
        >
          <List
            size="small"
            pagination={{ size: 'small' }}
            itemLayout="vertical"
            expandedRowRender={record => (
              <div style={{ margin: 0 }}>
                {this.renderExpand(record.property)}
              </div>
            )}
            dataSource={list[obj]}
            renderItem={(item) => {
              const imgTarget = _.find(item.property, { predicate_label: '资源图片' })
              return (
                <List.Item
                  style={{ padding: 10 }}
                  extra={(
                    <img
                      width="240px"
                      alt="logo"
                      style={{ display: imgTarget ? 'inline-block' : 'none' }}
                      src={imgTarget ? imgTarget.object : ''}
                    />
                  )}
                >
                  <List.Item.Meta
                    title={(
                      <a
                        href="javascript:;"
                        onClick={() => { window.open(_.find(item.property, { predicate_label: '资源链接' }).object) }}
                      >
                        { _.find(item.property, { predicate_label: '资源标题' }).object }
                      </a>
                    )}
                    description={(
                      <div>
                        <Icon
                          type="read"
                          style={{ marginRight: 8, color: '#fff' }}
                        />
                        资源类别：
                        {_.find(item.property, { predicate_label: '资源类别' }).object}
                      </div>
                    )}
                  />
                  <div>
                    {item.property.filter((e) => {
                      return (e.predicate_label !== '资源标题' && e.predicate_label !== '资源类别' && e.predicate_label !== '资源链接' && e.predicate_label !== '资源图片')
                    }).map(e => (
                      <div>
                        <div style={{ width: 100, textAlign: 'right', display: 'inline-block' }}>
                          {obj === '科学百科词条' ? e.predicate_label.split('百科infobox_')[1] : e.predicate_label}
                          ：
                          {' '}
                        </div>
                        <span>{e.object}</span>
                      </div>
                    ))}
                  </div>
                </List.Item>
              )
            }}
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
      forcename, dataSource, loading, searchKey, kgLarger, uri, subject, thinkData,
      imgList, selectImg, modalVisible, graph, type, graphHistory, showRelation,
    } = this.state
    return (
      <div style={{ paddingTop: 10, overflow: 'hidden', minWidth: 1300, backgroundColor: '#f2f6f7e6' }}>
        <div style={{ overflow: 'hidden' }}>
          <div>
            <div style={{ height: 80, overflow: 'hidden' }}>
              <div style={{ height: 60, margin: '10px 20px 0 0', float: 'right' }}>
              <Input
                value={searchKey}
                onChange={e => this.setState({ searchKey: e.target.value })}
                onPressEnter={e => this.handleJump(e.target.value)}
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
              <div style={{ marginLeft: 30, fontSize: 20, fontWeight: 700, float: 'left' }}>
              <span
                style={{
                  marginTop: 10,
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
              <span style={{ fontSize: 14, fontWeight: 400 }}>
                <a href="javascript:;"><Icon type="profile" /></a>
                <span style={{ margin: '0 10px' }}>分类：</span>
                {dataSource.filter((e) => { return e.predicatelabel === '分类' }).map((e, index) => {
                  if (index < dataSource.filter((j) => { return j.predicatelabel === '分类' }).length - 1) {
                    return (
                      <span>
                        {e.object ? e.object : e.objectLabel}
                        <Divider type="vertical" style={{ backgroundColor: '#bbb' }} />
                      </span>
                    )
                  } else {
                    return <span>{e.object ? e.object : e.objectLabel}</span>
                  }
                })}
              </span>
              <span style={{ color: '#000000a6' }}>{forcename}</span>
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
                      <Button type={showRelation === true ? 'danger' : 'none' } onClick={() => this.setState({ showRelation: true })}>关系图</Button>
                      <Button type={showRelation === false ? 'danger' : 'none' } onClick={() => this.setState({ showRelation: false })}>思维导图</Button>
                    </ButtonGroup>
                    <Button type="danger" onClick={() => this.setState({ kgLarger: !kgLarger })}>{kgLarger === true ? '还原' : '放大'}</Button>
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
                              : <div style={{ width: 24, display: 'inline-block' }} />
                            }
                            {e.name}
                          </a>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: kgLarger === true ? 600 : 450, width: kgLarger === true ? 1000 : 'auto', overflow: 'hidden' }}>
                      <Chart
                        graph={graph} forcename={forcename} resize={{ kgLarger, showRelation }}
                        handleExpandGraph={this.handleExpandGraph}
                      />
                    </div>
                  </div>
                  <div style={{ height: kgLarger === true ? 600 : 450, display: showRelation === true ? 'none' : 'block' }}>
                    <Think graph={thinkData} forcename={forcename} select={dataSource} resize={{ kgLarger, showRelation }} />
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
                  rowKey={record => record.propertyname}
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
                      <img src="https://edu.10086.cn/files/webupload//course/new/1599041949142.png" height="240px" width="360px" alt=""/>
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
            {/* {this.renderCard(wikiLinks)} */}
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
