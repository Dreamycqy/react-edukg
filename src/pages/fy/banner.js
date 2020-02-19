import React from 'react'
import moment from 'moment'
import icon from '@/assets/icon_scale.png'

const timerScaleCont = {
  display: 'inline-block',
  height: '100%',
  lineHeight: '80px',
}
const timeCircle = {
  display: 'inline-block',
  verticalAlign: 'middle',
  width: 30,
  height: 30,
  lineHeight: '30px',
  textAlign: 'center',
  fontSize: 10,
  color: '#fff',
  borderRadius: '50%',
  background: '#e2302e',
  transition: 'all .3s',
}
const lineScale = {
  display: 'inline-block',
  verticalAlign: 'middle',
  width: 50,
  height: 7,
  margin: '0 2px',
  background: `url(${icon}) no-repeat`,
  backgroundSize: 'cover',
}

export default class Banner extends React.Component {
  renderTimeline = () => {
    const timeLineHtml = []
    const timeRange = [0, 1, 2, 3, 4]
    timeRange.forEach((e) => {
      if (e === 4) {
        timeLineHtml.push(<div style={timerScaleCont}>
          <span style={timeCircle}>{moment().subtract(e, 'days').format('MM/DD')}</span>
            </div>) // eslint-disable-line
      } else if (e === 0) {
        timeLineHtml.push(<div style={timerScaleCont}>
          <span style={timeCircle}>{moment().subtract(e, 'days').format('MM/DD')}</span>
          <span style={lineScale} />
            </div>) // eslint-disable-line
      } else {
        timeLineHtml.push(<div style={timerScaleCont}>
          <span style={timeCircle}>{moment().subtract(e, 'days').format('MM/DD')}</span>
          <span style={lineScale} />
            </div>) // eslint-disable-line
      }
    })
    return timeLineHtml
  }

  render() {
    return (
      <div
        style={{ height: 80, lineHeight: '60px', cursor: 'pointer' }}
        onClick={() => window.open('http://edukg.cn/fy_news')}
      >
        {this.renderTimeline()}
        <div style={{ display: 'inline-block', marginLeft: 20, color: '#888888' }}>查看肺炎新闻时间线</div>
      </div>
    )
  }
}
