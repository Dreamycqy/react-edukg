import React from 'react'
import { Button, AutoComplete, Input, List, Empty, Avatar } from 'antd'
import { connect } from 'dva'
// import { routerRedux } from 'dva/router'
import { getUrlParams } from '@/utils/common'
import { newSearch } from '@/services/edukg'
import NewGraph from '@/pages/graph/newGraph'
import kgIcon from '@/assets/kgIcon.png'

let localCounter = 0

@connect()
class ClusterBroker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filter: getUrlParams().filter || '',
      loading: false,
      dataSource: [],
      uri: '',
      firstIn: true,
    }
  }

  componentWillMount = () => {
    // this.search(this.state.filter)
  }

  search = async (filter) => {
    this.setState({ loading: true, filter, firstIn: false })
    const data = await newSearch({
      searchKey: filter,
    })
    if (data.data) {
      this.setState({
        dataSource: data.data,
        uri: data.data[0] ? data.data[0].uri : '',
      })
    }
    this.setState({ loading: false })
  }

  handleHighlight = (str, filter) => {
    let lightStr = []
    const word = new RegExp(filter, 'ig')
    const arr = str.split(word)
    lightStr = [<span key={localCounter++} style={{ color: '#24b0e6' }}>{arr[0]}</span>]
    for (let i = 1; i < arr.length; i++) {
      const keyword = str.match(word)[i - 1]
      lightStr.push(<span key={localCounter++} style={{ color: 'red' }}>{keyword}</span>)
      lightStr.push(<span key={localCounter++} style={{ color: '#24b0e6' }}>{arr[i]}</span>)
    }
    return lightStr
  }

  handleInputChange = (value) => {
    this.setState({ filter: value })
  }

  render() {
    const {
      dataSource, filter, loading, uri, firstIn,
    } = this.state
    return (
      <div style={{ padding: 20, minWidth: 1200 }}>
        <div style={{ float: 'left', width: 420, marginBottom: 20 }}>
          <div style={{ height: 60 }}>
            <AutoComplete
              size="large"
              style={{
                width: 340, float: 'left',
              }}
              dataSource={[]}
              value={filter}
              onChange={value => this.handleInputChange(value, 'search')}
              onSelect={value => this.setState({ filter: value })}
              backfill
              placeholder="请输入科学教育相关知识点"
              optionLabelProp="value"
              defaultActiveFirstOption={false}
            >
              <Input
                onPressEnter={e => this.search(e.target.value)}
                style={{ borderBottomRightRadius: 0, borderTopRightRadius: 0 }}
              />
            </AutoComplete>
            <Button style={{ float: 'left', borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }} type="primary" size="large" onClick={() => this.search(filter)}>搜索</Button>
          </div>
          <List
            itemLayout="vertical"
            size="large"
            dataSource={dataSource}
            loading={loading}
            style={{
              width: 410,
              border: '1px solid #e8e8e8',
              display: dataSource.length > 0 ? 'block' : 'none',
              overflowY: 'scroll',
              backgroundColor: 'white',
              maxHeight: 1100,
              borderRadius: 4,
            }}
            renderItem={(item) => {
              return (
                <List.Item style={{ padding: '20px 20px 0 20px' }}>
                  <List.Item.Meta
                    avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                    title={(
                      <a
                        href="javascript:;"
                        onClick={() => {
                          this.setState({ uri: item.uri })
                        }}
                      >
                        {this.handleHighlight(item.label, filter)}
                      </a>
                    )}
                    description="Heres some descriptions."
                  />
                </List.Item>
              )
            }}
          />
        </div>
        <div
          style={{
            overflow: 'hidden',
            display: dataSource.length > 0 ? 'block' : 'none',
          }}
        >
          <NewGraph uri={uri} search={this.search} />
        </div>
        <Empty
          style={{ marginTop: 200, display: dataSource.length === 0 && firstIn === false ? 'block' : 'none' }}
          description="没有结果"
        />
        <div
          style={{ marginTop: 200, display: firstIn === true ? 'block' : 'none', textAlign: 'center' }}
        >
          <div style={{ display: 'inline-block' }}>
            <img src={kgIcon} alt="" width="200px" style={{ float: 'left' }} />
            <div style={{ width: 560, overflow: 'hidden', paddingTop: 30, paddingLeft: 50 }}>
              科学教育知识图谱是以中国的科学课程标准、
              美国的《Next Generation Science Standards》为基础，
              结合基础教育知识图谱edukg中的内容构建而成的面向科学教育的知识图谱。
              该图谱涵盖地球与宇宙科学、物质科学、生命科学三大模块，
              涉及到物理、化学、地理、生物四门学科，
              适合从小学起各个学段的学生和教师进行学习和使用。
              图谱中将科学学科的核心概念表示为树状知识体系，各个知识点以实体的形式展示。
              为充分利用互联网的学习资源，本图谱将科普中国等多个网站的图文、视频、学术论文等资源与知识点进行链接，
              实现知识的互联共通。
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default ClusterBroker
