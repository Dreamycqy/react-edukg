import React from 'react'
import { Spin, Radio, Button } from 'antd'
import { getQuestion, checkQuestionAnswer } from '@/services/kgApi'

class StudentPersona extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      testLoading: false,
      test: undefined,
      answerValue: {},
    }
  }

  UNSAFE_componentWillMount = () => {
    this.showTest(this.props.subject)
  }

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (this.props.subject !== nextProps.subject) {
      this.showTest(nextProps.subject)
    }
  }

  handleQuestion = (value, id) => {
    const { answerValue } = this.state
    answerValue[id] = value
    this.setState({ answerValue })
  }

  renderQuestions = (arr) => {
    if (!arr) {
      return
    }
    const { answerValue } = this.state
    const result = []
    let title = ''
    let a = ''
    let b = ''
    let c = ''
    let d = ''
    // const sentence1 = ''
    // const sentence2 = ''
    // const sentence3 = ''
    arr.forEach((item) => {
      if (item.body.split('A.')[1]) {
        title = item.body.split('A.')[0]
        a = item.body.split('A.')[1].split('B.')[0]
        b = item.body.split('B.')[1].split('C.')[0]
        c = item.body.split('C.')[1].split('D.')[0]
        d = item.body.split('D.')[1]
      } else if (item.body.split('A．')[1]) {
        title = item.body.split('A．')[0]
        a = item.body.split('A．')[1].split('B．')[0]
        b = item.body.split('B．')[1].split('C．')[0]
        c = item.body.split('C．')[1].split('D．')[0]
        d = item.body.split('D．')[1]
      } else if (item.body.split('A、')[1]) {
        title = item.body.split('A、')[0]
        a = item.body.split('A、')[1].split('B、')[0]
        b = item.body.split('B、')[1].split('C、')[0]
        c = item.body.split('C、')[1].split('D、')[0]
        d = item.body.split('D、')[1]
      } else {
        return
      }
      result.push(
        <div style={{ padding: 10 }}>
          <h3>
            {title}
            &nbsp;&nbsp;
            <Button type="link">添加收藏</Button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            {answerValue[item.id] ? `当前选择：${answerValue[item.id]}` : ''}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span style={{ color: 'green' }}>
              {item.isCorrect === true ? '正确' : ''}
            </span>
            <span style={{ color: 'red' }}>
              {item.isCorrect === false ? `正确答案：${item.correctAnswer}` : ''}
            </span>
          </h3>
          <Radio.Group
            value={answerValue[item.id]}
            onChange={(e) => this.handleQuestion(e.target.value, item.id)}
          >
            <Radio value="A">{a}</Radio>
            <br />
            <Radio value="B">{b}</Radio>
            <br />
            <Radio value="C">{c}</Radio>
            <br />
            <Radio value="D">{d}</Radio>
          </Radio.Group>
        </div>,
      )
    })
    return result
  }

  showTest = async (subject) => {
    this.setState({ test: [], testLoading: true, answerValue: {} })
    const data = await getQuestion({
      amount: 5,
      subject,
      gradeLevel: 1,
    })
    if (data) {
      this.setState({ test: data.data })
    }
    this.setState({ testLoading: false })
  }

  submit = async () => {
    const { test, answerValue } = this.state
    for (const i of test) {
      const data = await checkQuestionAnswer({ // eslint-disable-line
        id: i.id,
        answer: answerValue[i.id] || '',
      })
      if (data) {
        i.isCorrect = data.data.isCorrect
        i.correctAnswer = data.data.correctAnswer
      }
    }
    this.setState(test)
  }

  render() {
    const { testLoading, test } = this.state
    console.log(test)
    return (
      <div>
        <Spin spinning={testLoading}>
          <div style={{ display: test ? 'block' : 'none', marginBottom: 20 }}>
            {this.renderQuestions(test)}
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <Button type="primary" onClick={() => this.submit()}>提交答案</Button>
              <Button type="primary" style={{ marginLeft: 20 }}>一键收藏错题</Button>
            </div>
          </div>
        </Spin>
      </div>
    )
  }
}

export default StudentPersona
