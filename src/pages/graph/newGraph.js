import React from 'react'
import { Card, Spin, Table, List, Icon } from 'antd'
import _ from 'lodash'
import Chart from '@/components/charts/graph'
import { newResult } from '@/services/edukg'
import { graphData } from '@/utils/graphData'

const columns = [{
  title: '标签',
  dataIndex: 'predicate_label',
  width: 150,
  align: 'right',
  render: (text) => {
    return <span>{text || '属性'}</span>
  },
}, {
  title: 'none',
  width: 10,
}, {
  title: '内容',
  align: 'left',
  render: (text, record) => {
    const type = record.predicate.split('#')[1]
    if (type === 'image' || record.object.indexOf('getjpg') > 0) {
      return <img style={{ maxHeight: 300 }} alt="" src={record.object} />
    } else if (type === 'category') {
      return <span>{record.object_label}</span>
    } else {
      return <span>{record.object}</span>
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
        dataSource: data.data.propety,
        resource: data.data.paper.data[0].items,
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
      graph, forcename, dataSource, loading, resource,
    } = this.state
    return (
      <div style={{ padding: 20 }}>
        <div style={{ marginLeft: 30 }}>
          知识点：
          {forcename}
        </div>
        <Card style={{ margin: 30 }} title="关系图谱">
          <Spin spinning={loading}>
            <div style={{ height: 500 }}>
              <Chart graph={graph} forcename={forcename} search={this.props.search} />
            </div>
          </Spin>
        </Card>
        <Card style={{ margin: 30 }} title="知识属性">
          <Table
            dataSource={dataSource}
            columns={columns}
            loading={loading}
            size="small"
            showHeader={false}
            pagination={false}
            rowKey={record => record.propertyname}
          />
        </Card>
        <Card style={{ margin: 30 }} title="相关论文">
          <List
            itemLayout="vertical"
            size="large"
            dataSource={resource}
            loading={loading}
            pagination={{
              showSizeChanger: false,
            }}
            renderItem={(item) => {
              return (
                <List.Item>
                  <List.Item.Meta
                    title={(
                      <a
                        href="javascript:;"
                        target="_blank"
                        onClick={() => {}}
                      >
                        <span>{item.title_zh}</span>
                        <br />
                        <span>{item.title}</span>
                      </a>
                    )}
                    description={(
                      <div>
                        <Icon
                          type="clock-circle"
                          style={{ marginRight: 8 }}
                        />
                        出版信息：
                        {item.venue.info ? item.venue.info.name_zh || item.venue.info.name : ''}
                        &nbsp;&nbsp;
                        {item.year}
                        年
                        &nbsp;&nbsp;
                        第
                        {item.venue.issue}
                        期
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      </div>
                    )}
                  />
                  <div>
                    <div style={{ color: '#00000073' }}>
                      作者：
                      {
                        item.authors
                          ? item.authors.map((e) => {
                            return (
                              <span style={{ marginRight: 10 }}>
                                {e.name_zh ? e.name_zh : e.name}
                              </span>
                            )
                          })
                          : null
                      }
                    </div>
                    <div style={{ marginTop: 10, color: '#00000073' }}>
                      关键词：
                      {
                        item.keywords
                          ? item.keywords.map((e) => {
                            return <span style={{ marginRight: 10 }}>{e}</span>
                          })
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
