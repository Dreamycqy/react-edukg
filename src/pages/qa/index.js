import React from 'react'
import { Button, Input, Spin, Select, Icon, message } from 'antd'
import { connect } from 'dva'
// import { routerRedux } from 'dva/router'
import { qaSearch, callBack } from '@/services/edukg'
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
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      subject: 'chinese',
      searchKey: '',
      loading: false,
      result: {
        value: '',
        label: '',
        url: '',
        predicate: '',
      },
      callBackLoad: false,
    }
  }

  handleChangeType = (subject) => {
    this.setState({ subject })
  }

  handleSearch = async () => {
    const { subject, searchKey } = this.state
    this.setState({ loading: true })
    const data = await qaSearch({
      inputQuestion: searchKey,
      course: subject,
    })
    if (data) {
      this.setState({
        result: {
          value: data[0].value,
          label: data[0].subject,
          url: data[0].subjectUri,
          predicate: data[0].predicate,
        },
      })
    }
    this.setState({ loading: false })
  }

  handleJumpChart = (uri) => {
    const { lastSubject } = this.state
    const url = `http://edukg.cn/firstGraph?uri=${uri}&subject=${lastSubject}`
    window.open(url)
  }

  jumpRelated = async () => {
    const { subject, result } = this.state
    window.open(`/relatedPage?subjectName=${result.label}&course=${subject}`)
    // this.props.dispatch(routerRedux.push({
    //   pathname: '/relatedPage',
    //   query: {
    //     subjectName: result.label,
    //     course: subject,
    //   },
    // }))
  }

  tof = async (answer, trueOrFalse) => {
    this.setState({ callBackLoad: true })
    const data = await callBack({
      inputQuestion: this.state.searchKey,
      answer,
      trueOrFalse,
    })
    if (data) {
      message.success('反馈成功！')
    }
    this.setState({ callBackLoad: false })
  }

  render() {
    const {
      searchKey, loading, subject, result, callBackLoad,
    } = this.state
    const { locale } = this.props
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block', marginTop: 60, marginLeft: -30 }}>
          <div style={{ float: 'left' }}>
            <img src={Logo} alt="logo" width="84px" height="84px" />
          </div>
          <div style={{ float: 'left', fontSize: 42, marginTop: 16 }}>
            {dictionary.qaTitle[locale]}
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
          <div style={{ marginTop: 10 }}>
            <a href="javascript:;" onClick={() => this.setState({ searchKey: '李白字什么？' }, () => this.handleSearch())}>李白字什么？</a>
            <a href="javascript:;" onClick={() => this.setState({ searchKey: '《题西林壁》的作者是谁？' }, () => this.handleSearch())}>《题西林壁》的作者是谁？</a>
            <a href="javascript:;" onClick={() => this.setState({ searchKey: '“露从今夜白”的下一句是？' }, () => this.handleSearch())}>“露从今夜白”的下一句是？</a>
          </div>
        </div>
        <br />
        <br />
        <div style={{ display: 'inline-block', width: 700 }}>
          <Spin spinning={loading} size="large">
            <div style={{ display: result.value.length > 0 ? 'inline-block' : 'none', width: '100%' }}>
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
                <legend style={{ color: '#8cb2c5', left: '2em', width: 'auto' }}>答案</legend>
                <div style={{ marginBottom: 8, fontSize: 18 }}>
                  {
                    result.value.length > 0 ? result.value : null
                  }
                </div>
                <div style={{ marginBottom: 8, fontSize: 18 }}>
                  {
                    result.label.length > 0
                      ? (
                        <span>
                          相关词条：
                          <a href="javascript:;" onClick={() => this.jumpRelated()}>{result.label}</a>
                        </span>
                      ) : null
                  }
                </div>
              </fieldset>
            </div>
            <div style={{ display: result.value.length > 0 ? 'inline-block' : 'none', width: '100%' }}>
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
                <legend style={{ color: '#8cb2c5', left: '2em', width: 'auto' }}>答案</legend>
                <Spin spinning={callBackLoad}>
                  <div style={{ height: 60, textAlign: 'center', fontSize: 18 }}>
                    <span>
                      这是否正确回答了您的问题？
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span>
                      <a href="javascript:;" onClick={() => this.tof(`${result.label}--${result.predicate}--${result.value}`, 1)}><Icon type="like" style={{ color: 'lime' }} /></a>
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span>
                      <a href="javascript:;" onClick={() => this.tof(`${result.label}--${result.predicate}--${result.value}`, 0)}><Icon type="dislike" style={{ color: 'red' }} /></a>
                    </span>
                  </div>
                </Spin>
              </fieldset>
            </div>
          </Spin>
        </div>
      </div>
    )
  }
}

export default Home
