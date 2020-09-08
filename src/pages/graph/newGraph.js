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

const columns = [{
  title: '标签',
  dataIndex: 'predicate_label',
  width: 150,
  align: 'left',
  render: (text) => {
    return <span style={{ fontWeight: 700 }}>{text || '知识点'}</span>
  },
}, {
  title: 'none',
  width: 10,
}, {
  title: '内容',
  align: 'left',
  render: (text, record) => {
    const type = record.predicate ? record.predicate.split('#')[1] : ''
    if (type === 'image' || record.object.indexOf('getjpg') > -1 || record.object.indexOf('getpng') > -1) {
      return <img style={{ maxHeight: 300 }} alt="" src={record.object} />
    } else if (type === 'category' || (record.object.indexOf('http') > -1 && record.object_label.length > 0)) {
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
    }
  }

  componentWillMount() {
    this.getChart()
  }

  getChart = async () => {
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
      const { lable, propety, paper, resourcePropety } = data.data
      const wikiLinks = {}
      const newProperty = []
      // const params = graphData(data.data, '科学')
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
        // graph: {
        //   nodes: _.uniqBy(params.nodes.filter((e) => { return e.name !== undefined }), 'name'),
        //   links: params.links,
        // },
      })
    }
    this.setState({ loading: false })
  }

  handleData = (array) => {
    const result = []
    const imgList = []
    array.forEach((e) => {
      if (e.predicate_label !== '学术论文') {
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
            <img style={{ border: '1px solid #e8e8e8', margin: 20 }} src={e.object} alt="" height="220px" width="220px" />
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
        <Card className={Styles.myCard} id={obj} style={{ margin: 20 }} title={obj}>
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
      forcename, dataSource, loading, resource, filter, searchKey,
      imgList, wikiLinks, selectImg, modalVisible, graph,
    } = this.state
    return (
      <div style={{ paddingTop: 10, overflow: 'hidden', minWidth: 1300 }}>
        <div style={{ float: 'left', width: 250 }}>
          <div style={{ height: 60, marginLeft: 30, marginTop: 6 }}>
            <img style={{ float: 'left' }} src={GrapeImg} alt="" height="60px" />
            <div style={{ fontSize: 38, float: 'left', color: '#6e72df', fontWeight: 700 }}>SEKG</div>
          </div>
          <Anchor onClick={this.handleClick} className={Styles.anchor}>
            <Link href="#components-anchor-props" style={{ margin: 10 }} title="知识属性" />
            <Link href="#components-anchor-graph" style={{ margin: 10 }} title="知识图谱" />
            <Link href="#components-anchor-pics" style={{ margin: 10 }} title="相关图片" />
            {this.handleAnchor(wikiLinks)}
            <Link href="#components-anchor-pages" style={{ margin: 10 }} title="相关论文" />
          </Anchor>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ height: 80, margin: '10px 0 0 20px' }}>
            <Input
              value={searchKey}
              onChange={e => this.setState({ searchKey: e.target.value })}
              onPressEnter={e => this.handleJump(e.target.value)}
              placeholder="请输入科学教育相关知识点"
              style={{
                borderBottomRightRadius: 0,
                borderTopRightRadius: 0,
                width: '70%',
                height: 50,
                lineHeight: '50px',
                fontSize: 24,
                float: 'left',
              }}
            />
            <Button
              style={{
                float: 'left',
                height: 50,
                width: '12%',
                borderBottomLeftRadius: 0,
                borderTopLeftRadius: 0,
              }}
              type="primary" size="large"
              onClick={() => this.handleJump(searchKey)}
            >
              搜索
            </Button>
          </div>
          <div>
            <div style={{ marginLeft: 30, fontSize: 20, fontWeight: 700 }}>
              知识点：&nbsp;&nbsp;
              <span style={{ color: '#24b0e6' }}>{forcename}</span>
            </div>
            <Card className={Styles.myCard} id="components-anchor-props" style={{ margin: 10 }} bordered={false}>
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
            <Card
              className={Styles.myCard} id="components-anchor-graph"
              style={{ margin: 20 }} title="知识图谱"
            >
              <Spin spinning={loading}>
                <div style={{ height: 300 }}>
                  <Chart graph={graph} forcename={forcename} search={this.props.search} />
                </div>
              </Spin>
            </Card>
            <Card className={Styles.myCard} id="components-anchor-pics" style={{ margin: 20 }} title="相关图片">
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
              style={{ margin: 20 }}
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
