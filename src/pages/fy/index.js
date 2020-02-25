import React from 'react'
import { Input, Button, Row, Col, Pagination, Spin, message, Table } from 'antd'
import { connect } from 'dva'
import _ from 'lodash'
import { getUrlParams, changeUrlQuery } from '@/utils/common'
import { fyTotal, getPermission, detailTable } from '@/services/edukg'
import { graphData } from '@/utils/graphData'
import Chart from '@/components/charts/graph'
import dictionary from '@/constants/dictionary'
import backgroundImage from '@/assets/totalbg.jpg'
import styles from '@/components/container/local.css'
import Banner from './banner'
import LinkList from './linkList'

const columns = [{
  title: 'key',
  dataIndex: 'key',
  width: 100,
  align: 'right',
  render: (text, record) => {
    return <span style={{ fontSize: 12, color: record.key === '学科' ? '#0dafdf' : null }}>{record.key}</span>
  },
}, {
  title: 'none',
  width: 10,
}, {
  title: 'value',
  dataIndex: 'value',
  align: 'left',
  render: (text, record) => {
    return <span style={{ fontSize: 12, color: record.key === '学科' ? '#0dafdf' : null }}>{record.value}</span>
  },
}]

function mapStateToProps(state) {
  const { locale } = state.global
  return {
    locale,
  }
}
@connect(mapStateToProps)
class SearchPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchKey: getUrlParams().searchKey || '',
      dataSource: [],
      current: 1,
      pageSize: 5,
      total: 0,
      loading: false,
      tableData: [],
      token: '',
      info: {},
      instances: {
        code: 0,
        data: [],
      },
      chartData: {
        nodes: [],
        links: [],
      },
      forcename: '',
      tableLoading: false,
      linkData: {
        doc: [],
        video: [],
      },
    }
  }

  componentWillMount() {
    if (this.state.searchKey.length > 0) {
      this.handleSearch()
    }
  }

  onShowSizeChange = (current, pageSize) => {
    this.setState({ current, pageSize }, () => this.search())
  }

  pageChange = (page) => {
    this.setState({ current: page }, () => this.search())
  }

  showTotal = (total) => {
    const { current, pageSize } = this.state
    const target = current * pageSize
    return this.props.locale === 'cn' ? `共计 ${total} 条结果，当前第${target - pageSize + 1} - ${target}` : `Total: ${total}, now at ${target - pageSize + 1} - ${target}`
  }

  handleSearch = async () => {
    changeUrlQuery({
      searchKey: this.state.searchKey,
    })
    await this.setState({ current: 1 })
    await this.search()
    await this.permission()
    if (this.state.instances.code === 1) {
      this.handleSubjectChange('all')
    } else {
      this.detail()
    }
  }

  permission = async () => {
    const data = await getPermission({})
    if (data) {
      await this.setState({ token: data.token })
    }
  }

  detail = async () => {
    const { token, info } = this.state
    this.setState({ tableLoading: true })
    const data = await detailTable({
      uri: info.uri,
      subject: info.course,
      token,
    })
    if (data) {
      const params = graphData(data.graph, info.course)
      data.property.propety.unshift({ key: '学科', value: data.property.subject })
      this.setState({
        tableData: data.property.propety,
        forcename: params.forcename,
        chartData: {
          nodes: params.nodes,
          links: params.links,
        },
      })
    }
    this.setState({ tableLoading: false })
  }

  search = async () => {
    const { searchKey, current, pageSize } = this.state
    if (searchKey === '') {
      message.info('请输入您要查询的内容！')
      return
    }
    this.setState({ loading: true, tableLoading: true })
    const data = await fyTotal({
      searchKey,
      curPage: current,
      pageSize,
    })
    if (data.fullsearch) {
      const doc = []
      const video = []
      data.links.results.forEach((e) => {
        e.urilinks.forEach((i) => {
          if (i.sourcetype === '文档') {
            doc.push(i)
          } else {
            video.push(i)
          }
        })
      })
      await this.setState({
        dataSource: data.fullsearch.data.pager.rows,
        current: data.fullsearch.data.pager.curPage,
        pageSize: data.fullsearch.data.pager.pageSize,
        total: data.fullsearch.data.pager.totalCount,
        info: data.graphandproperties[0] || { uri: '', course: '' },
        instances: data.instanceList,
        linkData: { doc, video },
      })
    } else {
      message.error('请求失败！')
    }
    this.setState({ loading: false })
    this.setState({ tableLoading: false })
  }

  renderList = (dataSource) => {
    const result = []
    if (dataSource) {
      dataSource.forEach((e) => {
        result.push(
          <div style={{ marginBottom: 20 }} key={e.newsID}>
            <div>
              <p>
                <span style={{ color: 'black', fontSize: 16 }}>
                  新闻出处:
                  <a style={{ marginLeft: 10 }} onClick={() => window.open(e.newsurl)}>
                    {e.newstitle}
                  </a>
                </span>
              </p>
              <div>
                <div>
                  <p
                    className={styles.aLink}
                    dangerouslySetInnerHTML={{ __html: this.handleNewsLink(e.newscontent) }}
                  />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
              <span>
                新闻来源：
                {e.newssource}
              </span>
              <span style={{ marginLeft: 10 }}>
                发布时间：
                {e.newstime}
              </span>
            </div>
          </div>,
        )
      })
    }
    return result
  }

  renderInstance = (obj) => {
    const result = []
    const data = []
    if (obj.data) {
      obj.data.forEach((e) => {
        data.push(
          <span>
            {e.label}
            &nbsp;(
            <a
              href="javascript:;"
              onClick={() => this.handleSubjectChange('single', e)}
            >
              {e.course}
            </a>
            )
          </span>,
        )
      })
      result.push(
        <div>
          {data}
        </div>,
      )
      if (obj.code === 1) {
        const same = []
        obj.same.forEach((e) => {
          same.push(
            <span>
              <a
                href="javascript:;"
                onClick={() => this.handleSubjectChange('single', e)}
              >
                {e.course}
              </a>
              &nbsp;
            </span>,
          )
        })
        same.push(
          <span><a href="javascript:;" onClick={() => this.handleSubjectChange('all')}>全图</a></span>,
        )
        result.unshift(
          <div>
            {obj.same[0].label}
            &nbsp;(
            {same}
            )
          </div>,
        )
      }
    }
    return result
  }

  handleNewsLink = (array) => {
    let result = ''
    array.forEach((e, index) => {
      result += `<p> ${index + 1}. ${e} </p>`
    })
    return result
  }

  customForeach = async (arr, callback) => {
    const { length } = arr
    const O = Object(arr)
    let k = 0
    while (k < length) {
      if (k in O) {
        const kValue = O[k]
        await callback(kValue, k, O) // eslint-disable-line
      }
      k++
    }
  }

  handleSubjectChange = async (type, e) => {
    this.setState({ tableLoading: true })
    await this.permission()
    if (type === 'single') {
      await this.setState({ info: { course: e.course, uri: e.uri } })
      this.detail()
    } else {
      const { instances } = this.state
      const tableData = []
      const forcename = ''
      const nodes = []
      const links = []
      await this.customForeach(instances.same, async (item) => {
        const data = await detailTable({
          uri: item.uri,
          subject: item.course,
          token: this.state.token,
        })
        if (data) {
          const params = graphData(data.graph, item.course)
          const start = _.findIndex(nodes, { category: '0' })
          if (start > -1) {
            nodes.splice(start, 1)
          }
          params.nodes.forEach((a) => {
            nodes.push(a)
          })
          params.links.forEach((b) => {
            links.push(b)
          })
          data.property.propety.unshift({ key: '学科', value: data.property.subject })
          data.property.propety.forEach((c) => {
            tableData.push(c)
          })
        }
      })
      console.log(tableData)
      this.setState({
        tableData,
        forcename,
        chartData: {
          nodes,
          links,
        },
      })
    }
    this.setState({ tableLoading: false })
  }

  render() {
    const {
      searchKey, dataSource, total, current, pageSize, loading,
      instances, chartData, tableLoading, forcename, tableData, linkData,
    } = this.state
    const { locale } = this.props
    return (
      <div style={{ minWidth: 1330 }}>
        <div
          style={{ height: 60, backgroundImage: `url(${backgroundImage})`, paddingLeft: 24 }}
        >
          <span style={{
            color: '#1e95c3', float: 'left', fontWeight: 'bold', display: 'inline-block', lineHeight: '58px', marginRight: 10,
          }}
          >
            eduKG
          </span>
          <Input
            value={searchKey}
            onChange={e => this.setState({ searchKey: e.target.value })}
            onPressEnter={() => this.handleSearch()}
            placeholder={dictionary.placeholder[locale]}
            style={{
              float: 'left', borderBottomRightRadius: 0, borderTopRightRadius: 0, width: 600, marginTop: 14,
            }}
          />
          <Button
            style={{
              float: 'left', borderBottomLeftRadius: 0, borderTopLeftRadius: 0, marginTop: 14,
            }}
            type="primary"
            onClick={() => this.handleSearch()}
          >
            {dictionary.searchButton[locale]}
          </Button>
        </div>
        <Row>
          <Col span={13} style={{ paddingRight: 20 }}>
            <div>
              <div style={{ color: '#1e95c3', fontWeight: 'bold', marginBottom: 20 }}>
                <div
                  style={{
                    display: 'inline-block', width: 10, height: 20, backgroundColor: '#1e95c3', margin: '30px 0 -4px 0',
                  }}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;知识图谱
              </div>
              <Spin spinning={tableLoading}>
                <div style={{ width: 536, height: 358 }}>
                  <Chart graph={chartData} forcename={forcename} />
                </div>
              </Spin>
              <div style={{
                fontWeight: 400, fontSize: 12, color: 'black', marginLeft: 24,
              }}
              >
                图例说明：一级节点表示实例(instance)，二级节点圆圈代表分类、方形代表概念（class），悬浮到连线上显示的是两者的关系（relation）。
              </div>
              <div style={{ color: '#1e95c3', fontWeight: 'bold', marginBottom: 20 }}>
                <div
                  style={{
                    display: 'inline-block', width: 10, height: 20, backgroundColor: '#1e95c3', margin: '30px 0 -4px 0',
                  }}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;实体列表
              </div>
              <Spin spinning={tableLoading}>
                <div style={{ marginLeft: 24, fontSize: 12 }}>
                  {this.renderInstance(instances)}
                </div>
              </Spin>
              <div style={{ color: '#1e95c3', fontWeight: 'bold', marginBottom: 20 }}>
                <div
                  style={{
                    display: 'inline-block', width: 10, height: 20, backgroundColor: '#1e95c3', margin: '30px 0 -4px 0',
                  }}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;属性
              </div>
              <Table
                dataSource={tableData} columns={columns}
                style={{ marginLeft: 12 }}
                size="small" showHeader={false}
                pagination={false} bordered
                loading={tableLoading}
                locale={{
                  emptyText: '没有信息',
                }}
                rowKey={record => record.key + record.value}
              />
              <div style={{ color: '#1e95c3', fontWeight: 'bold', marginBottom: 20 }}>
                <div
                  style={{
                    display: 'inline-block', width: 10, height: 20, backgroundColor: '#1e95c3', margin: '30px 0 -4px 0',
                  }}
                />
                &nbsp;&nbsp;&nbsp;&nbsp;资源链接
              </div>
              <Spin spinning={loading}>
                <LinkList data={linkData} />
              </Spin>
            </div>
          </Col>
          <Col span={11} style={{ padding: '0 20px' }}>
            <Banner />
            <Spin spinning={loading} size="large">
              <div style={{ minHeight: 600 }}>
                {this.renderList(dataSource)}
              </div>
            </Spin>
            <Pagination
              total={total}
              showSizeChanger
              onShowSizeChange={this.onShowSizeChange}
              pageSize={pageSize}
              showQuickJumper
              showTotal={this.showTotal}
              onChange={this.pageChange}
              current={current}
              pageSizeOptions={['5', '10', '20']}
              size="small"
            />
          </Col>
        </Row>
      </div>
    )
  }
}

export default SearchPage
