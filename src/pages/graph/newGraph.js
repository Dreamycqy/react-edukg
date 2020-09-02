import React from 'react'
import { Card, Spin, Table, List, Icon, Cascader, Input, Button, Anchor, Carousel } from 'antd'
import _ from 'lodash'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { getUrlParams } from '@/utils/common'
import Chart from '@/components/charts/graph'
import { newResult } from '@/services/edukg'
import { graphData } from '@/utils/graphData'
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
      const params = graphData(data.data, '科学')
      this.setState({
        forcename: data.data.lable,
        dataSource: data.data.propety ? this.handleData(data.data.propety) : [],
        resource: data.data.paper ? data.data.paper.data[0].items : [],
        graph: {
          nodes: _.uniqBy(params.nodes.filter((e) => { return e.name !== undefined }), 'name'),
          links: params.links,
        },
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

  renderImg = (list) => {
    const result = []
    list.forEach((e) => {
      result.push(
        <div>
          <img src={e.object} alt="" height="280px" />
        </div>,
      )
    })
    return result
  }

  render() {
    const {
      graph, forcename, dataSource, loading, resource, filter, searchKey, imgList,
    } = this.state
    return (
      <div style={{ paddingTop: 10, overflow: 'hidden', minWidth: 1200 }}>
        <div style={{ marginTop: 20, height: 80 }}>
          <div style={{ width: '20%', float: 'left' }}>&nbsp;</div>
          <div style={{ width: '80%', paddingLeft: 20, float: 'left' }}>
            <Input
              value={searchKey}
              onChange={e => this.setState({ searchKey: e.target.value })}
              onPressEnter={e => this.handleJump(e.target.value)}
              placeholder="请输入科学教育相关知识点"
              style={{
                borderBottomRightRadius: 0,
                borderTopRightRadius: 0,
                height: 50,
                width: '63%',
                lineHeight: '50px',
                fontSize: 24,
                float: 'left',
              }}
            />
            <Button
              style={{
                float: 'left',
                width: '12%',
                height: 50,
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
        <div style={{ float: 'left', width: '20%', height: '100%' }}>
          <Anchor onClick={this.handleClick} className={Styles.anchor}>
            <Link href="#components-anchor-props" style={{ margin: 10 }} title="知识属性" />
            <Link href="#components-anchor-graph" style={{ margin: 10 }} title="知识图谱" />
            <Link href="#components-anchor-pics" style={{ margin: 10 }} title="相关图片" />
            <Link href="#components-anchor-pages" style={{ margin: 10 }} title="相关论文" />
          </Anchor>
        </div>
        <div style={{ overflow: 'hidden' }}>
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
          <Card className={Styles.myCard} id="components-anchor-graph" style={{ margin: 20 }} title="关系图谱">
            <Spin spinning={loading}>
              <div style={{ height: 300 }}>
                <Chart graph={graph} forcename={forcename} search={this.props.search} />
              </div>
            </Spin>
          </Card>
          <Card className={Styles.myCard} id="components-anchor-pics" style={{ margin: 20 }} title="相关图片">
            <Spin spinning={loading}>
              <div style={{ height: 300 }}>
                <Carousel style={{ height: 280 }} autoplay>
                  {this.renderImg(imgList)}
                </Carousel>
              </div>
            </Spin>
          </Card>
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
    )
  }
}

export default FirstGraph
