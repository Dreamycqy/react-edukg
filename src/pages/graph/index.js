import React from 'react'
import { Button, Input, Spin, Select } from 'antd'
import Highlighter from 'react-highlight-words'
import { connect } from 'dva'
import { graphSearch } from '@/services/edukg'
import { makeOption } from '@/utils/common'
import Logo from '@/assets/homeLogo.png'
import subjectList from '@/constants/subject'
import dictionary from '@/constants/dictionary'

const InputGroup = Input.Group

function mapStateToProps(state) {
  const { locale } = state.global
  return {
    locale,
  }
}
@connect(mapStateToProps)
class GraphList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      subject: 'chinese',
      lastSubject: 'chinese',
      searchKey: '',
      loading: false,
      dataSource: [],
    }
  }

  handleChangeType = (subject) => {
    this.setState({ subject })
  }

  handleSearch = async () => {
    const { subject, searchKey } = this.state
    this.setState({ loading: true })
    const data = await graphSearch({
      searchKey,
      subject,
    })
    if (data) {
      this.setState({ dataSource: data.data, lastSubject: subject })
    }
    this.setState({ loading: false })
  }

  handleJumpChart = (uri) => {
    const url = `/firstGraph?uri=${encodeURIComponent(uri)}&subject=${this.state.lastSubject}`
    window.open(url)
  }

  renderList = (data) => {
    const result = []
    data.forEach((e) => {
      result.push(
        <div style={{ marginBottom: 10 }}>
          <div>
            <a href="javascript:;" onClick={() => this.handleJumpChart(e.uri)}>
              <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[this.state.searchKey]}
                autoEscape
                textToHighlight={e.label.toString()}
              />
            </a>
          </div>
          <div>
            <span style={{ color: 'green' }}>实例</span>
              &nbsp;&nbsp;
            <span>
              分类：
              {e.category}
            </span>
          </div>
        </div>,
      )
    })
    return result
  }

  render() {
    const {
      searchKey, loading, dataSource, subject,
    } = this.state
    const { locale } = this.props
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block', marginTop: 60, marginLeft: -30 }}>
          <div style={{ float: 'left' }}>
            <img src={Logo} alt="logo" width="84px" height="84px" />
          </div>
          <div style={{ float: 'left', fontSize: 42, marginTop: 16 }}>
            {dictionary.graphTitle[locale]}
          </div>
        </div>
        <br />
        <div style={{ display: 'inline-block' }}>
          <InputGroup compact>
            <Select
              size="large"
              value={subject}
              onChange={value => this.handleChangeType(value)}
              style={{ width: 120, marginTop: 14 }}
            >
              {makeOption(subjectList[locale])}
            </Select>
            <Input
              size="large"
              value={searchKey}
              onChange={e => this.setState({ searchKey: e.target.value })}
              onPressEnter={() => this.handleSearch()}
              placeholder={dictionary.placeholder[locale]}
              style={{
                width: 500, marginTop: 14,
              }}
            />
            <Button
              size="large"
              style={{ marginTop: 14, width: 90 }}
              type="primary"
              onClick={() => this.handleSearch()}
            >
              {dictionary.searchButton[locale]}
            </Button>
          </InputGroup>
        </div>
        <br />
        <br />
        <div style={{ display: 'inline-block', width: 700 }}>
          <Spin spinning={loading} size="large">
            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: 20 }}>
                {locale === 'cn' ? '搜索结果：共搜到' : 'Total: '}
                {dataSource.length}
                {locale === 'cn' ? '条数据' : ''}
              </div>
              {this.renderList(dataSource)}
            </div>
          </Spin>
        </div>
      </div>
    )
  }
}

export default GraphList
