import React from 'react'
import { Card, Spin, Select, Checkbox, Button } from 'antd'
import { connect } from 'dva'
import uuid from 'uuid'
import _ from 'lodash'
import Script from 'react-load-script'
import Chart from '@/components/charts/simpleGraph'
import { getGraphBySubandGrade } from '@/services/kgApi'
import { getUrlParams, makeOption } from '@/utils/common'
import { searchByKnowId } from '@/services/knowledge'
import subjectList from '@/constants/subject'
import gradeList from '@/constants/gradeLevel'
import Think from './think'
import Tree from './graphTree'
import Styles from './style.less'

const test = /^[A-Za-z]+$/i
const ButtonGroup = Button.Group

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
      rawData: [],
      treeData: [],
      loadingChart: false,
      showSingle: false,
      uri: '',
      subject: getUrlParams().type === 'subject' ? getUrlParams().key : 'chinese',
      gradeLevel: getUrlParams().type === 'grade' ? getUrlParams().key : '1',
      showRelation: false,
      thinkData: [],
    }
  }

  UNSAFE_componentWillMount = () => {
    const { key, type } = getUrlParams()
    if (type === 'subject') {
      this.setState({ subject: key })
    } else {
      this.setState({ gradeLevel: key })
    }
    this.getChartData()
  }

  onhandleScript = (sign) => {
    if (sign === 'load') {
      this.setState({ thinkData: window.sheet })
    }
  }

  getChartData = async () => {
    this.setState({ loadingChart: true })
    const {
      subject, gradeLevel,
    } = this.state
    const data = await getGraphBySubandGrade({
      subject,
      gradeLevel,
    })
    if (data) {
      const rawData = this.handleGraphData(data.data)
      const basicGraph = this.generateGraph(JSON.parse(JSON.stringify(rawData)))
      const treeData = this.generateData(rawData)
      this.setState({ graph: basicGraph, loadingChart: false, rawData, treeData })
      // this.getDetail()
      // this.getData()
    }
  }

  generateGraph = (data) => {
    const { showSingle } = this.state
    const nodes = []
    const links = []
    const rawdata = data || this.state.rawData
    rawdata.forEach((e) => {
      const params = {
        name: e.name,
        category: e.type === 'class' ? '3' : '2',
        symbolSize: e.type === 'class' ? 20 : 12,
        uri: e.uri,
        symbol: 'circle',
        draggable: true,
        type: e.type,
        show: true,
        label: {
          normal: {
            show: true,
            position: 'bottom',
            formatter: (val) => {
              const strs = val.data.name.replace(' ', '\n').split('')
              let str = ''
              for (let j = 0, s; s = strs[j++];) {
                str += s
                if (!(j % 8) && !test.test(s)) str += '\n'
              }
              return str
            },
            textStyle: {
              color: '#000000',
              fontWeight: 'normal',
              fontSize: '12',
            },
          },
        },
      }
      const linkParams = {
        source: e.name,
        target: e.target,
      }
      if (showSingle === true || e.type === 'class') {
        nodes.push(params)
        if (e.target) {
          links.push(linkParams)
        }
      }
    })
    const result = { nodes: _.uniqBy(nodes, 'name'), links }
    return result
  }

  generateData = (list) => {
    const result = {}
    const startKey = []
    const newList = list || this.state.rawData
    const theName = _.find(subjectList, { value: this.state.subject }).name
    newList.forEach((item) => {
      if (!result[item.uri]) {
        result[item.uri] = item
      }
    })
    const map = []
    newList.forEach((item) => {
      if (item.name === theName && startKey.indexOf(item.uri) < 0) {
        startKey.push(item.uri)
      }
      if (item.target_uri) {
        if (!result[item.target_uri].children) {
          result[item.target_uri].children = []
        }
        if (!_.find(result[item.target_uri].children, { uri: item.uri })) {
          result[item.target_uri].children.push(item)
        }
      } else if (this.state.showSingle === true && item.name !== theName) {
        map.push(item)
      }
    })
    startKey.forEach((e) => {
      map.unshift(result[e])
    })
    return map
  }

  getNewInstance = async (knowId) => {
    this.setState({ loadingChart: true })
    const data = await searchByKnowId({
      knowId,
    })
    const { thinkData } = this.state
    if (data) {
      data.data.forEach((e, index) => {
        let divider = ''
        if (index < 9) {
          divider = '00'
        } else if (index < 99) {
          divider = '0'
        }
        if (!_.find(thinkData, { 知识点名称: e.entity_name })) {
          thinkData.push({
            知识点名称: e.entity_name,
            uri: e.entity_uri,
            层级节点: '6',
            知识点编码: knowId + divider + index,
            学科名称: this.state.subject,
          })
        }
      })
      this.setState({ thinkData })
    }
    this.setState({ loadingChart: false })
  }

  handleShowSingle = async (showSingle) => {
    await this.setState({ showSingle })
    this.setState({
      graph: this.generateGraph(),
      treeData: this.generateData(),
    })
  }

  handleGraphData = (array) => {
    const result = []
    array.forEach((e) => {
      if (e.path.length > 0) {
        result.push({
          target: null,
          target_uri: null,
          name: e.path[0][e.path[0].length - 1].categoryLabel,
          uri: e.path[0][e.path[0].length - 1].category,
          type: 'class',
        })
        e.path[0].forEach((p, index) => {
          result.push({
            target_uri: p.category,
            target: p.categoryLabel,
            name: index === 0 ? e.uriName : e.path[0][index - 1].categoryLabel,
            uri: index === 0 ? e.uri : e.path[0][index - 1].category,
            type: 'class',
          })
        })
      } else {
        result.push({
          target_uri: null,
          target: null,
          name: e.uriName,
          uri: e.uri,
          type: 'instance',
        })
      }
    })
    return result
  }

  renderSource = (array) => {
    const result = []
    array.forEach((e) => {
      result.push(
        <div key={uuid()}>
          {e.bookname}
          --------
          <span dangerouslySetInnerHTML={{ __html: e.as.split("href='/epubimg").join("href='http://edukg.cn/epubimg") }} /> {/* eslint-disable-line */}
        </div> // eslint-disable-line
      )
    })
    return result
  }

  handleSelect = (uri) => {
    if (uri === this.state.uri) {
      return
    }
    this.setState({ uri }, () => {
      // this.getDetail()
      // this.getData()
    })
  }

  selectTarget = (uri) => {
    this.handleSelect(uri)
  }

  render() {
    const {
      graph, loadingChart, showRelation, thinkData,
      subject, gradeLevel, showSingle, uri, treeData,
    } = this.state
    const { locale } = this.props
    const extraOption = (
      <div>
        <ButtonGroup style={{ marginRight: 20 }}>
          <Button type={showRelation === true ? 'primary' : 'none'} onClick={() => this.setState({ showRelation: true })}>关系图</Button>
          <Button type={showRelation === false ? 'primary' : 'none'} onClick={() => this.setState({ showRelation: false })}>思维导图</Button>
        </ButtonGroup>
        <Checkbox
          checked={showSingle}
          onChange={() => this.handleShowSingle(!showSingle)}
        >
          显示散点
        </Checkbox>
        <a href="javascript:;">全部折叠</a>
      </div>
    )

    return (
      <div style={{ padding: '20px 10px' }}>
        <Script
          url="http://39.97.172.123:3000/cmcc/data.js"
          onCreate={() => this.onhandleScript('create')}
          onError={() => this.onhandleScript('error')}
          onLoad={() => this.onhandleScript('load')}
        />
        <div style={{ paddingLeft: 10 }}>
          <Select
            style={{ marginRight: 20, width: 160 }} value={subject}
            onChange={(value) => this.setState({ subject: value }, () => this.getChartData())}
          >
            {makeOption(subjectList)}
          </Select>
          <Select
            style={{ marginRight: 20, width: 240 }} value={gradeLevel}
            onChange={(value) => this.setState({ gradeLevel: value }, () => this.getChartData())}
          >
            {makeOption(gradeList)}
          </Select>
        </div>
        <div style={{ height: 650, minWidth: 1250 }}>
          <Card
            style={{ float: 'left', margin: 10, height: 650, width: '100%' }}
            title={locale === 'cn' ? '关系图谱' : 'Relation Graph'}
            extra={extraOption}
            className={Styles.myCard}
          >
            <Spin spinning={loadingChart}>
              <div style={{ height: 580 }}>
                <div
                  style={{
                    float: 'left',
                    width: 300,
                    borderRight: '1px solid #e8e8e8',
                    height: 580,
                    overflowY: 'scroll',
                    padding: '0 10px',
                    display: showRelation === true ? 'block' : 'none',
                  }}
                >
                  <Tree treeData={treeData} selectTarget={this.selectTarget} uri={uri} />
                </div>
                <div style={{ height: 580, overflow: 'hidden' }}>
                  {
                    showRelation === true
                      ? (
                        <Chart
                          graph={graph} config={{ showSingle }}
                          handleSelect={this.handleSelect} uri={uri}
                          forcename={uri} newClassGraph
                        />
                      )
                      : (
                        <Think
                          graph={thinkData}
                          subject={this.state.subject}
                          getNewInstance={this.getNewInstance}
                        />
                      )
                  }
                </div>
              </div>
            </Spin>
          </Card>
        </div>
      </div>
    )
  }
}

export default FirstGraph
