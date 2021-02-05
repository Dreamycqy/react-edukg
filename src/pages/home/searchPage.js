import React from 'react'
import { Button, AutoComplete, Input, List, Empty, Avatar, Divider, Select } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { searchResultV3 } from '@/services/knowledge'
import { getUrlParams } from '@/utils/common'
import kgIcon from '@/assets/kgIcon.png'
import GrapeImg from '@/assets/grape.png'
import noteImg from '@/assets/eduIcon/note.png'
import phyImg from '@/assets/eduIcon/phy.png'
import chemImg from '@/assets/eduIcon/chem.png'
import bioImg from '@/assets/eduIcon/bio.png'
import geoImg from '@/assets/eduIcon/geo.png'
import subList from '@/constants/subject'

let localCounter = 0
const { Option } = Select

@connect()
class ClusterBroker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filter: getUrlParams().filter || '',
      subject: 'chinese',
      loading: false,
      dataSource: [],
      oriSource: [],
      firstIn: true,
      selectValue: ['instance', 'class'],
    }
  }

  UNSAFE_componentWillMount = () => {
    const { filter } = this.state
    if (filter.length > 0) {
      this.search(filter)
    }
  }

  checkAvatar = () => {
    const { subject } = this.state
    if (subject === 'geo') {
      return geoImg
    } else if (subject === 'biology') {
      return bioImg
    } else if (subject === 'physics') {
      return phyImg
    } else if (subject === 'chemistry') {
      return chemImg
    } else {
      return noteImg
    }
  }

  search = async (filter, sub) => {
    const { selectValue, subject } = this.state
    this.setState({ loading: true, filter, firstIn: false, subject: sub || subject })
    const data = await searchResultV3({
      subject: sub || subject,
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
      pathname: '/knowledgeWiki/kgPage',
      query: {
        key: 'chinese',
        type: 'subject',
      },
    }))
  }

  render() {
    const {
      dataSource, filter, loading, firstIn, subject,
    } = this.state
    const selectItem = (
      <Select
        style={{
          width: 80,
          paddingLeft: 25,
        }}
        size="large"
        value={subject}
        dropdownMatchSelectWidth
        onChange={(value) => this.setState({ subject: value })}
      >
        {subList.map((e) => {
          return <Option style={{ textAlign: 'center' }} key={e.value} value={e.value}>{e.name}</Option>
        })}
      </Select>
    )
    return (
      <div style={{ margin: '0 auto', width: 1200, minHeight: 800, backgroundColor: '#fffffff1', paddingTop: 20 }}>
        <div style={{ marginBottom: '0 auto 20px', textAlign: 'center' }}>
          <div style={{ height: 70, width: 900, display: 'inline-block' }}>
            <div style={{ height: 60, display: 'inline-block', float: 'left' }}>
              <img style={{ float: 'left' }} src={GrapeImg} alt="" height="60px" />
              <div style={{ fontSize: 36, float: 'left', color: '#6e72df', fontWeight: 700 }}>Edukg</div>
            </div>
            <AutoComplete
              size="large"
              style={{
                width: 520, float: 'left', marginTop: 10, marginLeft: 30,
              }}
              dataSource={[]}
              value={filter}
              onChange={(value) => this.handleInputChange(value, 'search')}
              onSelect={(value) => this.setState({ filter: value })}
              backfill
              optionLabelProp="value"
              defaultActiveFirstOption={false}
            >
              <Input
                onPressEnter={(e) => this.search(e.target.value)}
                placeholder="请输入基础教育相关知识点"
                addonBefore={selectItem}
                style={{
                  borderRadius: 0,
                  height: 40,
                  lineHeight: '40px',
                  fontSize: 20,
                  backgroundColor: '#fff',
                }}
              />
            </AutoComplete>
            <Button
              style={{
                float: 'left',
                width: 100,
                height: 40,
                marginTop: 10,
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
            <a href="javascript:;" onClick={() => this.search('亚洲', 'geo')}>亚洲</a>
            <Divider type="vertical" />
            <a href="javascript:;" onClick={() => this.search('入射光线', 'physics')}>入射光线</a>
            <Divider type="vertical" />
            <a href="javascript:;" onClick={() => this.search('动能、势能的大小变化及判断', 'physics')}>动能、势能的大小变化及判断</a>
          </div>
          <br />
          <List
            itemLayout="vertical"
            size="large"
            dataSource={dataSource}
            loading={loading}
            style={{
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
              return (
                <List.Item style={{ padding: 20 }}>
                  <List.Item.Meta
                    avatar={<Avatar size={64} src={this.checkAvatar()} />}
                    title={(
                      <a
                        href="javascript:;"
                        onClick={() => {
                          window.open(`/knowledgeWiki/knowledge?name=${escape(item.entity_name)}&type=instance&subject=${subject}`)
                        }}
                      >
                        {this.handleHighlight(item.entity_name, filter)}
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
                            backgroundColor: '#24b0e6',
                            borderColor: '#24b0e6',
                            borderRadius: 4,
                            marginRight: 12,
                          }}
                        >
                          实体
                        </span>
                      </span>
                    )}
                  />
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
              {/* eslint-disable-next-line max-len */}
              本知识图谱是一个大规模的基础教育领域的知识图谱，它提供了基础教育领域中的多维知识描述， 还包含与其他基础教育文本资源的实体连接。 另外，本知识图谱是基于基础教育领域权威的教材教辅资料和海量的互联网文本资源，通过知识图谱构建技术构建得到， 所包含的内容非常丰富。可以通过知识图谱的搜索功能进行实体搜索，搜索结果既展示了该实体与其他实体的关系，也展示了该实体的所有属性及知识来源。
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
