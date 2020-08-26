import React from 'react'
import { Card, Spin, Table, List, Icon, Switch } from 'antd'
import _ from 'lodash'
import Chart from '@/components/charts/graph'
import { newResult } from '@/services/edukg'
import { graphData } from '@/utils/graphData'
import Styles from './style.less'

const columns = [{
  title: '标签',
  dataIndex: 'predicate_label',
  width: 150,
  align: 'right',
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
    if (type === 'image' || record.object.indexOf('getjpg') > 0) {
      return <img style={{ maxHeight: 300 }} alt="" src={record.object} />
    } else if (type === 'category') {
      return <span style={{ color: '#24b0e6' }}>{record.object_label}</span>
    } else {
      return <span style={{ color: '#24b0e6' }}>{record.object}</span>
    }
  },
}]

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
      uri: this.props.uri,
      checked: true,
    }
  }

  componentWillMount() {
    this.getChart()
  }

  componentWillReceiveProps = async (nextProps) => {
    if (nextProps.uri !== this.state.uri) {
      await this.setState({ uri: nextProps.uri })
      this.getChart()
    }
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
        dataSource: data.data.propety ? data.data.propety.filter((e) => { return e.predicate_label !== '学术论文' }) : [],
        resource: data.data.paper ? data.data.paper.data[0].items : [],
        graph: {
          nodes: _.uniqBy(params.nodes.filter((e) => { return e.name !== undefined }), 'name'),
          links: params.links,
        },
      })
    }
    this.setState({ loading: false })
  }

  render() {
    const {
      graph, forcename, dataSource, loading, resource, checked,
    } = this.state
    return (
      <div style={{ paddingTop: 10 }}>
        <div style={{ marginLeft: 30, fontSize: 20, fontWeight: 700 }}>
          知识点：&nbsp;&nbsp;
          <span style={{ color: '#24b0e6' }}>{forcename}</span>
        </div>
        <Card className={Styles.myCard} style={{ margin: 20 }} title="知识属性">
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
        <Card className={Styles.myCard} style={{ margin: 20 }} title="关系图谱">
          <Spin spinning={loading}>
            <div style={{ height: 300 }}>
              <Chart graph={graph} forcename={forcename} search={this.props.search} />
            </div>
          </Spin>
        </Card>
        <Card
          className={Styles.myCard}
          style={{ margin: 20 }}
          title="相关论文"
          extra={(
            <Switch
              checked={checked}
              checkedChildren="相关度正序" unCheckedChildren="相关度反序"
              onChange={e => this.setState({ checked: e })}
            />
          )}
        >
          <List
            itemLayout="vertical"
            size="large"
            dataSource={_.orderBy(resource, 'score', checked === true ? 'desc' : 'asc')}
            loading={loading}
            pagination={{
              showSizeChanger: false,
              size: 'small',
              style: { display: resource.length > 0 ? 'block' : 'none' },
            }}
            style={{ height: 400, overflowY: 'scroll', padding: '0 20px 20px 20px' }}
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
                    <div style={{ color: '#00000073' }}>
                      <Icon
                        type="diff"
                        style={{ marginRight: 8, color: '#24b0e6' }}
                      />
                      相关度：
                      <span style={{ color: 'red' }}>{item.score}</span>
                    </div>
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
    )
  }
}

export default FirstGraph
