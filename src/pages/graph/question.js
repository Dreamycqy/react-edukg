import React from 'react'
import { Radio } from 'antd'

class StudentPersona extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      test: [{
        title: '下列说法正确的是',
        a: '天圆地方',
        b: '天如斗笠,地如翻盘',
        c: '地球是不规则球体',
        d: '地球是个圆的',
        id: '1',
        correctAnswer: 'C',
      }, {
        title: '下列自然现象中,由于地球公转产生的是',
        a: '季节的变化',
        b: '昼夜交替的变化',
        c: '经纬网的划分',
        d: '地轴的倾斜',
        id: '2',
        correctAnswer: 'A',
      }, {
        title: '关于地球自转,下列描述正确的是',
        a: '从赤道上空看自西向东转',
        b: '从赤道上空看自东向西转',
        c: '从北极上空看顺时针转动',
        d: '从南极上空看逆时针转动',
        id: '3',
        correctAnswer: 'A',
      }, {
        title: '下列有关地球自转的说法,不正确的是',
        a: '地球自转的绕转中心是地轴',
        b: '地球自转的方向是自西向东',
        c: '地球自转产生了季节变化现象',
        d: '地球自转一周的时间约为24小时,也就是一天',
        id: '4',
        correctAnswer: 'C',
      }, {
        title: '下列关于地球上海陆面积的说法,正确的是',
        a: '29%是海洋,71%是陆地',
        b: '60%是海洋,40%是陆地',
        c: '七分海洋,三分陆地',
        d: '三分海洋,七分陆地',
        id: '5',
        correctAnswer: 'C',
      }],
      answerValue: {
      },
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
    arr.forEach((item) => {
      const { title, a, b, c, d } = item
      result.push(
        <div style={{ padding: 10 }}>
          <h3>
            {title}
            &nbsp;&nbsp;&nbsp;&nbsp;
            {answerValue[item.id] ? `当前选择：${answerValue[item.id]}` : ''}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span style={{ display: answerValue[item.id] ? 'inline-block' : 'none' }}>
              <span style={{ color: 'green' }}>
                {item.correctAnswer === answerValue[item.id] ? '正确' : ''}
              </span>
              <span style={{ color: 'red' }}>
                {item.correctAnswer !== answerValue[item.id] ? `正确答案：${item.correctAnswer}` : ''}
              </span>
            </span>
          </h3>
          <Radio.Group
            value={answerValue[item.id]}
            onChange={e => this.handleQuestion(e.target.value, item.id)}
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

  render() {
    const { test } = this.state
    return (
      <div>
        {this.renderQuestions(test)}
      </div>
    )
  }
}

export default StudentPersona
