import React from 'react'
import { Button, AutoComplete, Input, List } from 'antd'
import { connect } from 'dva'
// import { routerRedux } from 'dva/router'
import { getUrlParams } from '@/utils/common'
import { newSearch } from '@/services/edukg'
import NewGraph from '@/pages/graph/newGraph'

let localCounter = 0
const { Option } = AutoComplete

@connect()
class ClusterBroker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filter: getUrlParams().filter || '',
      loading: false,
      dataSource: [],
      options: [],
      uri: '',
    }
  }

  componentWillMount = () => {
    this.search(this.state.filter)
  }

  searchSelect = async () => {
    this.setState({ options: [] })
  }

  search = async (filter) => {
    this.setState({ loading: true, filter })
    const data = await newSearch({
      searchKey: filter,
    })
    if (data.data) {
      this.setState({ dataSource: data.data, uri: data.data[0] ? data.data[0].uri : '' })
    }
    this.setState({ loading: false })
  }

  handleHighlight = (str, filter) => {
    let lightStr = []
    const word = new RegExp(filter, 'ig')
    const arr = str.split(word)
    lightStr = [<span key={localCounter++}>{arr[0]}</span>]
    for (let i = 1; i < arr.length; i++) {
      const keyword = str.match(word)[i - 1]
      lightStr.push(<span key={localCounter++} style={{ color: 'red' }}>{keyword}</span>)
      lightStr.push(<span key={localCounter++}>{arr[i]}</span>)
    }
    return lightStr
  }

  handleInputChange = (value) => {
    this.setState({ filter: value }, () => setTimeout(() => this.searchSelect(value), 1000))
  }

  renderOption = (data) => {
    const children = []
    const { filter } = this.state
    data.forEach(item => children.push(
      <Option key={item} value={item}>
        {this.handleHighlight(item, filter)}
      </Option>,
    ))
    return children
  }

  render() {
    const {
      dataSource, filter, loading, options, uri,
    } = this.state
    return (
      <div style={{ padding: 20 }}>
        <div style={{ height: 60, borderBottom: '1px solid #e8e8e8' }}>
          <AutoComplete
            size="large"
            style={{
              width: 444, float: 'left',
            }}
            dataSource={this.renderOption(options)}
            value={filter}
            onChange={value => this.handleInputChange(value, 'search')}
            onSelect={value => this.setState({ filter: value })}
            backfill
            placeholder="请输入要搜索的内容"
            optionLabelProp="value"
            defaultActiveFirstOption={false}
          >
            <Input
              onPressEnter={e => this.search('result', e.target.value)}
              style={{ borderBottomRightRadius: 0, borderTopRightRadius: 0 }}
            />
          </AutoComplete>
          <Button style={{ float: 'left', borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }} type="primary" size="large" onClick={() => this.search('result')}>搜索</Button>
        </div>
        <div style={{ minHeight: 500 }}>
          <List
            itemLayout="vertical"
            size="large"
            dataSource={dataSource}
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              pageSize: 20,
              size: 'small',
            }}
            style={{ float: 'left', width: 300 }}
            renderItem={(item) => {
              return (
                <List.Item style={{ padding: '20px 0 0 20px' }}>
                  <List.Item.Meta
                    title={(
                      <a
                        href="javascript:;"
                        onClick={() => this.setState({ uri: item.uri })}
                      >
                        {this.handleHighlight(item.label, filter)}
                      </a>
                    )}
                  />
                </List.Item>
              )
            }}
          />
          <div style={{ overflow: 'hidden' }}>
            <NewGraph uri={uri} search={this.search} />
          </div>
        </div>
      </div>
    )
  }
}
export default ClusterBroker
