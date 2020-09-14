import React from 'react'
import { Card, Spin, Table, List, Icon, Cascader, Input, Button, Anchor, Modal, Tree, Popover } from 'antd'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import _ from 'lodash'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import Chart from '@/components/charts/graph'
import { newResult, getClassTree } from '@/services/edukg'
import GrapeImg from '@/assets/grape.png'
import Styles from './style.less'

const { Link } = Anchor
const test = /^[A-Za-z]+$/i
const { TreeNode } = Tree
const { Search } = Input
const dataList = []

let parentKey = []

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
      return <span style={{ color: '#24b0e6' }}>{record.labelList.join('， ')}</span>
    } else {
      return <span style={{ color: '#24b0e6' }}>{record.object}</span>
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
      forcename: '科学',
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
      type: 'class',
      expandedKeys: [],
      selectKey: '',
      treeData: [],
      searchValue: '',
      autoExpandParent: true,
      basicGraph: [{
        nodes: [],
        links: [],
      }],
    }
  }

  componentWillMount() {
    this.getTree()
  }

  onSelect = async (keys) => {
    if (keys.length === 0) {
      return
    }
    await this.setState({
      selectKey: keys[0],
    })
    this.handleExpandGraph({
      uri: keys[0],
      type: 'class',
    })
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    })
  }

  onTreeSearch = (e) => {
    const { value } = e.target
    parentKey = []
    dataList.forEach((item) => {
      if (!item.name) {
        return
      }
      if (item.name.indexOf(value) > -1) {
        this.getParentKey(item.uri, this.state.treeData)
      }
    })
    const expandedKeys = parentKey
    this.setState({
      expandedKeys: _.uniq(expandedKeys),
      searchValue: value,
      autoExpandParent: true,
    })
  }

  generateData = (list) => {
    const result = {}
    const startKey = []
    const newList = list
    newList.push({
      uri: 'http://webprotege.stanford.edu/R816WDEyFZ6LnUcUbMsDuzR',
      name: '科学',
      target_name: null,
      target: null,
      type: 'class',
    })
    newList.forEach((item) => {
      if (!result[item.uri]) {
        result[item.uri] = item
      }
    })
    newList.forEach((item) => {
      if (item.target === null) {
        startKey.push(item.uri)
      }
      if (result[item.target]) {
        if (!result[item.target].children) {
          result[item.target].children = []
        }
        if (!_.find(result[item.target].children, { uri: item.uri })) {
          result[item.target].children.push(item)
        }
      }
    })
    const map = []
    startKey.forEach((e) => {
      map.push(result[e])
    })
    return map
  }

  generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i]
      const { uri, name } = node
      dataList.push({ uri, name })
      if (node.children) {
        this.generateList(node.children)
      }
    }
  }

  generateGraph = (data) => {
    const nodes = [{
      name: '科学',
      category: '3',
      symbolSize: 20,
      uri: 'http://webprotege.stanford.edu/R816WDEyFZ6LnUcUbMsDuzR',
      symbol: 'circle',
      draggable: true,
      type: 'class',
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
    }]
    const links = []
    data.forEach((e) => {
      nodes.push({
        name: e.name,
        category: '3',
        symbolSize: 20,
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
      links.push({
        source: e.name,
        target: e.target_name,
      })
    })
    return { nodes: _.uniqBy(nodes, 'name'), links }
  }

  getParentKey = (uri, tree) => {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.children) {
        if (node.children.some(item => item.uri === uri)) {
          parentKey.push(node.uri)
        } else {
          this.getParentKey(uri, node.children)
        }
      }
    }
  }

  getTree = async () => {
    const data = await getClassTree({})
    if (data) {
      const basicGraph = this.generateGraph(JSON.parse(JSON.stringify(data.data)))
      const treeData = this.generateData(data.data)
      await this.generateList(treeData)
      await this.setState({ treeData, basicGraph })
      this.getChart('first')
      this.defaultExpand(treeData)
    }
  }

  getChart = async (first) => {
    this.setState({ loading: true })
    const { uri } = this.state
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
      const { lable, propety, paper, resourcePropety, content, type } = data.data
      const wikiLinks = {}
      const newProperty = []
      const params = this.remakeGraphData(content, lable, type)
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
      await this.setState({
        forcename: lable,
        dataSource: propety ? this.handleData(newProperty) : [],
        resource: paper ? paper.data[0].items : [],
        wikiLinks,
        selectKey: uri,
        type,
      })
      if (type === 'class') {
        this.setState({ graph: params })
        if (!first) {
          this.onTreeSearch({ target: { value: lable } })
        }
      }
    }
    this.setState({ loading: false })
  }

  remakeGraphData = (list, forcename) => {
    const nodes = []
    const links = []
    list.forEach((e) => {
      if (e.type !== 'instance') {
        return
      }
      nodes.push({
        name: e.object_label || e.subject_label,
        category: '2', // 叶子节点
        symbolSize: 12, // 节点大小
        uri: e.object || e.subject,
        show: true,
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
      links.push({
        source: e.object_label || e.subject_label,
        target: forcename,
      })
    })
    return { nodes, links }
  }

  defaultExpand = (list) => {
    const expandedKeys = []
    list.forEach((e) => {
      expandedKeys.push(e.uri)
      e.children.forEach((j) => {
        expandedKeys.push(j.uri)
      })
    })
    this.setState({ expandedKeys })
  }

  handleData = (array) => {
    const result = []
    const imgList = []
    array.forEach((e) => {
      if (e.predicate_label && e.predicate_label !== '学术论文') {
        if (e.type === 'image' || e.object.indexOf('getjpg') > 0 || e.object.indexOf('getpng') > 0) {
          imgList.push(e)
        } else {
          const target = _.find(result, { predicate_label: e.predicate_label })
          if (!target) {
            result.push({
              ...e,
              labelList: [e.object_label],
            })
          } else {
            target.labelList.push(e.object_label)
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
    await this.setState({ uri: target.uri, type: target.type })
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
            <img style={{ border: '1px solid #e8e8e8', margin: 10, objectFit: 'cover' }} src={e.object} alt="" height="160px" width="160px" />
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
          <List
            size="small"
            pagination={false}
            itemLayout="vertical"
            expandedRowRender={record => (
              <div style={{ margin: 0 }}>
                {this.renderExpand(record.propety)}
              </div>
            )}
            dataSource={list[obj]}
            renderItem={(item) => {
              const imgTarget = _.find(item.propety, { predicate_label: '资源图片' })
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
                        onClick={() => { window.open(_.find(item.propety, { predicate_label: '资源链接' }).object) }}
                      >
                        { _.find(item.propety, { predicate_label: '资源标题' }).object }
                      </a>
                    )}
                    description={(
                      <div>
                        <Icon
                          type="read"
                          style={{ marginRight: 8, color: '#24b0e6' }}
                        />
                        资源类别：
                        {_.find(item.propety, { predicate_label: '资源类别' }).object}
                      </div>
                    )}
                  />
                  <div>
                    {item.propety.filter((e) => {
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

  renderTreeNodes = (data) => {
    const { searchValue } = this.state
    const result = []
    data.forEach((item) => {
      if (!item.name) {
        return
      }
      const index = item.name.indexOf(searchValue)
      const beforeStr = item.name.substr(0, index)
      const afterStr = item.name.substr(index + searchValue.length)
      const titleText = index > -1
        ? (
          <span>
            {beforeStr}
            <span style={{ color: '#f50' }}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item.name}</span>
        )
      const title = (
        <span>
          <Icon
            style={{ color: '#24b0e6', marginRight: 6 }} type="right-circle"
          />
          {titleText}
        </span>
      )
      if (item.children) {
        result.push(
          <TreeNode
            title={title} key={item.uri}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>,
        )
      } else {
        result.push(<TreeNode
          title={title} key={item.uri}
        />)
      }
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

  mixData = (data, basic, forcename) => {
    data.nodes.forEach((e) => {
      if (e.name === forcename) {
        e.name += '(实体)'
      }
    })
    const nodes = data.nodes.concat(basic.nodes)
    const links = data.links.concat(basic.links)
    return {
      nodes,
      links,
    }
  }

  render() {
    const {
      forcename, dataSource, loading, resource, filter, searchKey, searchValue, autoExpandParent,
      imgList, wikiLinks, selectImg, modalVisible, graph, type, selectKey, expandedKeys, treeData,
      basicGraph,
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
        <div style={{ float: 'left', width: '70%', padding: 10 }}>
          <Card
            className={Styles.myCard}
            id="components-anchor-graph"
            title={(
              <div style={{ fontSize: 20, fontWeight: 700 }}>
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
              </div>
            )}
            extra={(
              <Popover
                content={(
                  <div>
                    点击概念树或者图上节点，选中概念知识点并展开下级概念，直至底层实体节点。
                  </div>
                )}
                title="说明"
              >
                <a href="javascript:;"><Icon type="question-circle" /></a>
              </Popover>
            )}
          >
            <Spin spinning={loading}>
              <div style={{ float: 'left', width: 300, borderRight: '1px solid #e8e8e8', height: 600, overflowY: 'scroll', padding: '0 10px' }}>
                <Search
                  style={{ marginBottom: 8, width: 280 }}
                  placeholder="请输入概念名称，模糊搜索"
                  onChange={this.onTreeSearch} size="small"
                  value={searchValue}
                />
                <Tree
                  blockNode
                  autoExpandParent={autoExpandParent}
                  onSelect={this.onSelect}
                  selectedKeys={[selectKey]}
                  onExpand={this.onExpand}
                  expandedKeys={expandedKeys}
                >
                  {this.renderTreeNodes(treeData)}
                </Tree>
              </div>
              <div style={{ height: 600, overflow: 'hidden' }}>
                <Chart
                  graph={this.mixData(graph, basicGraph, forcename)} forcename={forcename}
                  handleExpandGraph={this.handleExpandGraph} newClassGraph
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
                    style={{ height: 180, backgroundColor: 'aliceblue' }}
                    dots slidesPerRow={2}
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
