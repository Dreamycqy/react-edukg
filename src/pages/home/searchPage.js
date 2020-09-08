import React from 'react'
import { Button, AutoComplete, Input, List, Empty, Avatar, Select } from 'antd'
import { connect } from 'dva'
// import _ from 'lodash'
import { routerRedux } from 'dva/router'
import { newSearch } from '@/services/edukg'
import { getUrlParams } from '@/utils/common'
import kgIcon from '@/assets/kgIcon.png'
// import colorList from '@/constants/colorList'

let localCounter = 0
const { Option } = Select

@connect()
class ClusterBroker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filter: getUrlParams().filter || '',
      loading: false,
      dataSource: [],
      oriSource: [],
      firstIn: true,
      selectValue: 'all',
    }
  }

  componentWillMount = () => {
    const { filter } = this.state
    if (filter.length > 0) {
      this.search(filter)
    }
  }

  search = async (filter) => {
    this.setState({ loading: true, filter, firstIn: false })
    const data = await newSearch({
      searchKey: filter,
    })
    if (data.data) {
      this.setState({
        dataSource: data.data,
        oriSource: data.data,
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

  handleJump = (uri) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/newGraph',
      query: {
        uri: escape(uri),
      },
    }))
  }

  handleFilter = (value) => {
    const { oriSource } = this.state
    this.setState({ selectValue: value })
    if (value === 'all') {
      this.setState({ dataSource: oriSource })
    } else if (value === 'instance') {
      this.setState({ dataSource: oriSource.filter((e) => { return e.type === 'instance' }) })
    } else {
      this.setState({ dataSource: oriSource.filter((e) => { return e.type !== 'instance' }) })
    }
  }

  render() {
    const {
      dataSource, filter, loading, firstIn, selectValue,
    } = this.state
    const rtn = dataSource.map(i => ({ raw: i, len: i.label.length }))
      .sort((p, n) => p.len - n.len)
      .map(i => i.raw)
    // const rtn = rtn1.map(i => ({ raw: i, len: i.label.length }))
    //   .sort((p, n) => n.indexOf(filter) - p.indexOf(filter))
    //   .map(i => i.raw)
    return (
      <div style={{ padding: '20px 0', minWidth: 1200 }}>
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <div style={{ height: 80, width: 900, display: 'inline-block' }}>
            <AutoComplete
              size="large"
              style={{
                width: 720, float: 'left',
              }}
              dataSource={[]}
              value={filter}
              onChange={value => this.handleInputChange(value, 'search')}
              onSelect={value => this.setState({ filter: value })}
              backfill
              optionLabelProp="value"
              defaultActiveFirstOption={false}
            >
              <Input
                onPressEnter={e => this.search(e.target.value)}
                placeholder="请输入科学教育相关知识点"
                style={{
                  borderBottomRightRadius: 0,
                  borderTopRightRadius: 0,
                  height: 60,
                  lineHeight: '60px',
                  fontSize: 24,
                }}
              />
            </AutoComplete>
            <Button
              style={{
                float: 'left',
                width: 180,
                height: 60,
                borderBottomLeftRadius: 0,
                borderTopLeftRadius: 0,
              }}
              type="primary" size="large"
              onClick={() => this.search(filter)}
            >
              搜索
            </Button>
          </div>
          <div
            style={{
              display: firstIn === true ? 'none' : 'inline-block',
              width: 900,
              textAlign: 'left',
            }}
          >
            <Select value={selectValue} style={{ width: 200 }} onChange={value => this.handleFilter(value)}>
              <Option key="all" value="all">全部</Option>
              <Option key="instance" value="instance">实体</Option>
              <Option key="class" value="class">概念</Option>
            </Select>
          </div>
          <List
            itemLayout="vertical"
            size="large"
            dataSource={rtn}
            loading={loading}
            style={{
              // border: '1px solid #e8e8e8',
              width: 900,
              display: dataSource.length > 0 || loading === true ? 'block' : 'none',
              backgroundColor: 'white',
              borderRadius: 4,
              margin: '0 auto',
              textAlign: 'left',
            }}
            pagination={{
              showQuickJumper: true,
            }}
            renderItem={(item) => {
              let target2
              let target3
              for (const i of item.property) {
                if (i.type === 'image' || i.object.indexOf('getjpg') > 0 || i.object.indexOf('getpng') > 0) {
                  if (!target3) {
                    target3 = i
                  }
                }
                if (i.predicate_label === '分类' && i.object_label.length > 0) {
                  target2 = i
                }
              }
              return (
                <List.Item style={{ padding: 20 }}>
                  <List.Item.Meta
                    avatar={target3 ? (
                      <Avatar size={64} src={target3.object} />
                    ) : (
                      <Avatar size={64}>
                        {item.label.substr(0, 1)}
                      </Avatar>
                    )}
                    title={(
                      <a
                        href="javascript:;"
                        onClick={() => {
                          // this.handleJump(item.uri)
                          window.open(`/newGraph?uri=${escape(item.uri)}`)
                        }}
                      >
                        {this.handleHighlight(item.label, filter)}
                      </a>
                    )}
                    description={(
                      <span>
                        <span
                          style={{
                            color: 'white',
                            padding: '2px 20px',
                            display: 'inline-block',
                            textAlign: 'center',
                            border: '1px solid',
                            backgroundColor: item.type === 'instance' ? '#24b0e6' : '#28d100',
                            borderColor: item.type === 'instance' ? '#24b0e6' : '#28d100',
                            borderRadius: 4,
                            marginRight: 12,
                          }}
                        >
                          {item.type === 'instance' ? '实体' : '概念'}
                        </span>
                        <span>
                          {target2 ? '所属分类：' : ''}
                        </span>
                        <span>
                          {target2 ? target2.object_label.length > 0 ? target2.object_label : target2.object : ''}
                        </span>
                      </span>
                    )}
                  />
                  <div style={{ color: '#888', fontSize: 12, marginLeft: 80 }}>
                    {`uri: ${item.uri}`}
                  </div>
                </List.Item>
              )
            }}
          />
        </div>
        <Empty
          style={{ marginTop: 200, display: dataSource.length === 0 && firstIn === false && loading === false ? 'block' : 'none' }}
          description="没有结果"
        />
        <div
          style={{ marginTop: 100, display: firstIn === true ? 'block' : 'none', textAlign: 'center' }}
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
