import React from 'react'
import { Button } from 'antd'

class SearchPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: 'doc',
    }
  }

  renderList = (array) => {
    const result = []
    array.forEach((e, index) => {
      result.push(<div key={e.linkname}><a href="javascript:;" onClick={() => window.open(e.link)}>{`${index + 1}. ${e.linkname}`}</a></div>)
    })
    return result
  }

  render() {
    const { type } = this.state
    return (
      <div>
        <div style={{ height: 40, marginLeft: 24 }}>
          <Button
            style={{ float: 'left', marginRight: 20 }}
            type="primary"
            onClick={() => this.setState({ type: 'doc' })}
          >
            文档
          </Button>
          <Button
            style={{ float: 'left', backgroundColor: '#b6a2de', borderColor: '#b6a2de' }}
            type="primary"
            onClick={() => this.setState({ type: 'video' })}
          >
            视频
          </Button>
        </div>
        <div style={{ marginLeft: 24, fontSize: 12 }}>
          {this.renderList(this.props.data[type])}
        </div>
      </div>
    )
  }
}

export default SearchPage
