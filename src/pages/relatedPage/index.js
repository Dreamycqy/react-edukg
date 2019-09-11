import React from 'react'
import { Spin } from 'antd'
import { connect } from 'dva'
import { relatedPage } from '@/services/edukg'
import { getUrlParams } from '@/utils/common'

function mapStateToProps(state) {
  const { locale } = state.global
  return {
    locale,
  }
}
@connect(mapStateToProps)
class Relate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      loading: false,
    }
  }

  componentWillMount() {
    this.getRelated()
  }

  getRelated = async () => {
    const { subjectName, course } = getUrlParams()
    this.setState({ loading: true })
    const data = await relatedPage({
      subjectName,
      course,
    })
    if (data) {
      this.setState({ dataSource: data })
    }
    this.setState({ loading: false })
  }

  renderTextArea = (data) => {
    const result = []
    data.forEach((i, index) => {
      result.push(<div style={{ fontSize: 16, fontWeight: 700 }}>{`${i.subject}：`}</div>)
      result.push(<div style={{ marginBottom: 20, borderBottom: index === data.length - 1 ? null : '1px solid #e8e8e8', paddingBottom: 20 }} dangerouslySetInnerHTML={{ __html: i.value }} />) // eslint-disable-line
    })
    return result
  }

  render() {
    const {
      dataSource, loading,
    } = this.state
    const { locale } = this.props
    return (
      <div style={{ padding: '20px 15%' }}>
        <h1 style={{ textAlign: 'center' }}>
          {getUrlParams().subjectName}
          {locale === 'cn' ? '的相关知识' : '‘s Related Knowledge'}
        </h1>
        <Spin spinning={loading}>
          <fieldset
            style={{
              display: 'block',
              padding: '1em 1em 1em 1.5em',
              border: '1px solid #b7e2ec',
              marginBottom: '2em',
              borderRadius: 15,
              textAlign: 'left',
            }}
          >
            <legend style={{ color: '#8cb2c5', left: '2em', width: 'auto' }}>{locale === 'cn' ? '相关知识' : 'Related Knowledge'}</legend>
            <div>
              {this.renderTextArea(dataSource)}
            </div>
          </fieldset>
        </Spin>
      </div>
    )
  }
}

export default Relate
