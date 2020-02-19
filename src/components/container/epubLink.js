import React from 'react'
import styles from './local.css'

export default class SearchPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
    }
  }

  epubimg = (content) => {
    const { htmlId } = this.props
    const postUrl = 'http://edukg.cn/epubimg'
    const ExportForm = document.createElement('FORM')
    ExportForm.id = 'form'
    ExportForm.style.display = 'none'
    ExportForm.action = postUrl
    ExportForm.method = 'post'
    ExportForm.target = '_blank'
    const newElement = document.createElement('input')
    newElement.setAttribute('name', 'htmlId')
    newElement.value = htmlId
    newElement.setAttribute('type', 'hidden')
    const newElement1 = document.createElement('input')
    newElement1.setAttribute('name', 'content')
    newElement1.value = content
    newElement1.setAttribute('type', 'hidden')
    ExportForm.appendChild(newElement)
    ExportForm.appendChild(newElement1)
    document.body.appendChild(ExportForm)
    ExportForm.submit()
    ExportForm.remove()
  }

  renderList = (dataSource, show) => {
    const result = []
    if (dataSource) {
      dataSource.forEach(
        (e, index) => {
          result.push(
            <span key={e} style={{ display: (index < 3 || show) ? 'inline-block' : 'none' }}>
              <a
                href="javascript:;"
                className={styles.aLink}
                onClick={() => this.epubimg(e)}
                dangerouslySetInnerHTML={{ __html: `${index + 1}.${e}` }} // eslint-disable-line
              />
              <br />
            </span>,
          )
        },
      )
    }
    return result
  }

  render() {
    const { list } = this.props
    const { show } = this.state
    return (
      <div style={{
        overflow: 'hidden', minHeight: 128, fontSize: 12, position: 'relative',
      }}
      >
        {this.renderList(list, show)}
        <div style={{ right: 10, bottom: 0, position: 'absolute' }}>
          <a
            href="javascript:;"
            onClick={() => this.setState({ show: !show })}
            style={{ color: '#b0b8b9' }}
          >
            {show ? '<<收起结果' : `查看全部${list ? list.length : 0}个相关结果>>`}
          </a>
        </div>
      </div>
    )
  }
}
