import React from 'react'
import { Card, Spin, Table } from 'antd'
import { connect } from 'dva'
import uuid from 'uuid'
import Chart from '@/components/charts/graph'
import { queryByUri, querygraph, getPermission, getInstGraph } from '@/services/edukg'
import { getUrlParams } from '@/utils/common'
import { graphData } from '@/utils/graphData'

const columns = [{
  title: 'key',
  dataIndex: 'key',
  width: 120,
  align: 'right',
}, {
  title: 'none',
  width: 10,
}, {
  title: 'value',
  dataIndex: 'value',
  align: 'left',
}]

const columnsMath = [{
  title: 'key',
  dataIndex: 'propertyname',
  width: 120,
  align: 'right',
}, {
  title: 'none',
  width: 10,
}, {
  title: 'value',
  dataIndex: 'instname',
  align: 'left',
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
      resource: [],
      loadingChart: false,
      loadingTable: false,
      token: '',
      uri: getUrlParams().uri,
      subject: getUrlParams().subject,
    }
  }

  componentWillMount() {
    this.getData()
  }

  componentDidMount() {
    this.getChart()
  }

  getChart = async () => {
    this.setState({ loadingChart: true })
    const { uri, subject, token } = this.state
    if (subject === 'math') {
      const data = await getInstGraph({
        uri,
      })
      if (data) {
        const params = graphData(data, subject)
        this.setState({
          forcename: params.forcename,
          graph: {
            nodes: params.nodes,
            links: params.links,
          },
        })
      }
    } else {
      const data = await queryByUri({
        uri,
        subject,
        token,
      })
      if (data) {
        const params = graphData(data, subject)
        this.setState({
          forcename: params.forcename,
          graph: {
            nodes: params.nodes,
            links: params.links,
          },
        })
      }
    }
    this.setState({ loadingChart: false })
  }

  getData = async () => {
    this.setState({ loadingTable: true })
    await this.permission()
    const { uri, subject, token } = this.state
    const data = await querygraph({
      uri,
      subject,
      token,
    })
    if (data) {
      this.setState({ dataSource: data.propety, resource: data.source })
    }
    this.setState({ loadingTable: false })
  }

  permission = async () => {
    const data = await getPermission({})
    if (data) {
      await this.setState({ token: data.token })
    }
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
      graph, forcename, dataSource, resource, loadingChart, loadingTable, subject,
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
            columns={subject === 'math' ? columnsMath : columns}
            loading={loadingTable}
            size="small"
            showHeader={false}
            pagination={false}
            rowKey={record => (subject === 'math' ? record.propertyname + record.instname : record.key + record.value)}
          />
        </Card>
        <Card style={{ margin: 30 }} title={locale === 'cn' ? '知识来源' : 'resource'}>
          <Spin spinning={loadingTable}>
            {this.renderSource(resource)}
          </Spin>
        </Card>
      </div>
    )
  }
}

export default FirstGraph
