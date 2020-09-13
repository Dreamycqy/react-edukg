import React from 'react'
import { Button, AutoComplete, Input, List, Empty, Avatar, Checkbox, Divider } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { newSearch } from '@/services/edukg'
import { getUrlParams } from '@/utils/common'
import kgIcon from '@/assets/kgIcon.png'
import GrapeImg from '@/assets/grape.png'
import noteImg from '@/assets/eduIcon/note.png'
import phyImg from '@/assets/eduIcon/phy.png'
import chemImg from '@/assets/eduIcon/chem.png'
import bioImg from '@/assets/eduIcon/bio.png'
import geoImg from '@/assets/eduIcon/geo.png'

let localCounter = 0
const plainOptions = [
  { label: '实体', value: 'instance' },
  { label: '概念', value: 'class' },
]

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
      selectValue: ['instance', 'class'],
    }
  }

  componentWillMount = () => {
    const { filter } = this.state
    if (filter.length > 0) {
      this.search(filter)
    }
  }

  checkAvatar = (uri) => {
    if (uri.indexOf('geo#') > -1) {
      return geoImg
    } else if (uri.indexOf('biology#') > -1) {
      return bioImg
    } else if (uri.indexOf('physics#') > -1) {
      return phyImg
    } else if (uri.indexOf('chemistry#') > -1) {
      return chemImg
    } else {
      return noteImg
    }
  }

  search = async (filter) => {
    const { selectValue } = this.state
    this.setState({ loading: true, filter, firstIn: false })
    const data = await newSearch({
      searchKey: filter,
    })
    if (data.data) {
      if (selectValue.length === 2) {
        this.setState({ dataSource: data.data })
      } else {
        this.setState({ dataSource: data.data.filter((e) => {
          return e.type === selectValue[0]
        }) })
      }
      this.setState({
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

  handleFilter = (value) => {
    const { oriSource } = this.state
    this.setState({ selectValue: value })
    if (value.length === 2) {
      this.setState({ dataSource: oriSource })
    } else {
      this.setState({ dataSource: oriSource.filter((e) => { return e.type === value[0] }) })
    }
  }

  handleJumpGraph = () => {
    this.props.dispatch(routerRedux.push({
      pathname: '/classGraph',
      query: {
      },
    }))
  }

  render() {
    const {
      dataSource, filter, loading, firstIn, selectValue,
    } = this.state
    const rtn1 = dataSource.map(i => ({ raw: i, len: i.label }))
      .sort((p, n) => p.len.indexOf(filter) - n.len.indexOf(filter))
      .map(i => i.raw)
    const rtn = rtn1.map(i => ({ raw: i, len: i.label.length }))
      .sort((p, n) => p.len - n.len)
      .map(i => i.raw)
    return (
      <div style={{ margin: '0 auto', width: 1200, minHeight: 800, backgroundColor: '#ffffffee', paddingTop: 20 }}>
        <div style={{ marginBottom: '0 auto 20px', textAlign: 'center' }}>
          <div style={{ height: 70, width: 900, display: 'inline-block' }}>
            <div style={{ height: 60, display: 'inline-block', float: 'left' }}>
              <img style={{ float: 'left' }} src={GrapeImg} alt="" height="60px" />
              <div style={{ fontSize: 38, float: 'left', color: '#6e72df', fontWeight: 700 }}>SEKG</div>
            </div>
            <AutoComplete
              size="large"
              style={{
                width: 520, float: 'left', marginLeft: 30,
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
                  backgroundColor: '#fff',
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
          <br />
          <div style={{ height: 30, width: 900, display: 'inline-block' }}>
            例：
            <a href="javascript:;" onClick={() => this.search('亚洲')}>亚洲</a>
            <Divider type="vertical" />
            <a href="javascript:;" onClick={() => this.search('法拉第电磁感应定律')}>法拉第电磁感应定律</a>
            <Divider type="vertical" />
            <a href="javascript:;" onClick={() => this.search('动能、势能的大小变化及判断')}>动能、势能的大小变化及判断</a>
          </div>
          <br />
          <div
            style={{
              display: firstIn === true ? 'none' : 'inline-block',
              width: 900,
              textAlign: 'left',
            }}
          >
            <Checkbox.Group
              options={plainOptions} value={selectValue}
              onChange={this.handleFilter}
            />
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
              backgroundColor: '#ffffffa6',
              borderRadius: 4,
              margin: '0 auto',
              textAlign: 'left',
              paddingBottom: 30,
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
                      <Avatar size={64} src={this.checkAvatar(item.uri)} />
                    )}
                    title={(
                      <a
                        href="javascript:;"
                        onClick={() => {
                          window.open(`/newGraph?uri=${escape(item.uri)}&type=${item.type}`)
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
            <div style={{ width: 560, overflow: 'hidden', paddingTop: 10, paddingLeft: 50 }}>
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
            <Button
              style={{ marginTop: 20, marginLeft: 10 }}
              type="primary" href="javascript:;"
              onClick={() => this.handleJumpGraph()}
            >
              浏览图谱
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
export default ClusterBroker
