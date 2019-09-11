import React from 'react'
import { Table } from 'antd'
import { connect } from 'dva'
import { detailCard } from '@/services/edukg'
import { getUrlParams } from '@/utils/common'

const columns = [{
  title: 'key',
  dataIndex: 'feature_key',
  width: 150,
  align: 'right',
}, {
  title: 'none',
  width: 10,
}, {
  title: 'value',
  dataIndex: 'feature_value',
  align: 'left',
}]

function mapStateToProps(state) {
  const { locale } = state.global
  return {
    locale,
  }
}
@connect(mapStateToProps)
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      loading: false,
    }
  }

  componentWillMount() {
    this.getDetailCard()
  }

  getDetailCard = async () => {
    const { uri, course } = getUrlParams()
    this.setState({ loading: true })
    const data = await detailCard({
      uri,
      course,
    })
    if (data) {
      if (data.entity_name) {
        data.entity_features.unshift({ feature_key: '名称', feature_value: data.entity_name })
      }
      this.setState({ dataSource: data.entity_features })
    }
    this.setState({ loading: false })
  }

  render() {
    const {
      dataSource, loading,
    } = this.state
    const { locale } = this.props
    return (
      <div style={{ padding: '20px 15%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 20 }}>
          {locale === 'cn' ? '知识卡片' : 'Knowledge Card'}
        </h1>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          showHeader={false}
          pagination={false}
          bordered
          rowKey={record => record.feature_key + record.feature_value}
        />
      </div>
    )
  }
}

export default Home
