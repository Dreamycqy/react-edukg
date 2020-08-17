import React from 'react'
import { Card, Spin, Table } from 'antd'
import { connect } from 'dva'
import uuid from 'uuid'
import Chart from '@/components/charts/graph'
import { newResult } from '@/services/edukg'
import { getUrlParams } from '@/utils/common'
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

function mapStateToProps(state) {
  const { locale } = state.global
  return {
    locale,
  }
}
@connect(mapStateToProps)
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
      loadingChart: false,
      loadingTable: false,
      uri: unescape(getUrlParams().uri) || '',
    }
  }

  componentDidMount() {
    this.getChart()
  }

  getChart = async () => {
    this.setState({ loadingChart: true, loadingTable: true })
    const { uri } = this.state
    const data = await newResult({
      uri,
    })
    if (data) {
      const params = graphData(data.data, '科学')
      this.setState({
        forcename: data.data.label,
        dataSource: data.data.propety,
        graph: {
          nodes: params.nodes.filter((e) => { return e.name !== undefined }),
          links: params.links,
        },
      })
    }
    this.setState({ loadingChart: false, loadingTable: false })
  }

  renderSource = (array) => {
    const result = []
    array.forEach((e) => {
      console.log(e)
      result.push(
        <div key={uuid()}>
          {e.bookname}
          --------
          <span dangerouslySetInnerHTML={{ __html: e.as }} /> {/* eslint-disable-line */}
        </div> // eslint-disable-line
      )
    })
    return result
  }

  render() {
    const {
      graph, forcename, dataSource, loadingChart, loadingTable,
    } = this.state
    const { locale } = this.props
    return (
      <div style={{ padding: '20px 5%' }}>
        <Card style={{ margin: 30 }} title={locale === 'cn' ? '关系图谱' : 'Relation Graph'}>
          <Spin spinning={loadingChart}>
            <div style={{ height: 500 }}>
              <Chart graph={graph} forcename={forcename} />
            </div>
          </Spin>
        </Card>
        <Card style={{ margin: 30 }} title={locale === 'cn' ? '知识属性' : 'Property'}>
          <Table
            dataSource={dataSource}
            columns={columns}
            loading={loadingTable}
            size="small"
            showHeader={false}
            pagination={false}
            rowKey={record => record.propertyname}
          />
        </Card>
        {/* <Card style={{ margin: 30 }} title={locale === 'cn' ? '知识来源' : 'resource'}>
          <Spin spinning={loadingTable}>
            {this.renderSource(resource)}
          </Spin>
        </Card> */}
      </div>
    )
  }
}

export default FirstGraph
