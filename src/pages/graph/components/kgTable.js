import React from 'react'
import { Table } from 'antd'
import domtoimage from 'dom-to-image'
import moment from 'moment'
import Styles from '../style.less'

function checkDiction(text) {
  if (diction[text]) {
    return diction[text]
  } else {
    return text
  }
}

const diction = {
  下属于: '属于',
  分类: '类别',
  相关于: '相关',
  部分于: '属于',
  强相关于: '相关',
  关系右元: '相关',
  关系左元: '相关',
}

const columns = [{
  title: '标签',
  dataIndex: 'predicateLabel',
  width: 100,
  align: 'left',
  render: (text) => {
    return <span style={{ fontWeight: 700 }}>{checkDiction(text)}</span>
  },
}, {
  title: 'none',
  width: 10,
}, {
  title: '内容',
  align: 'left',
  render: (text, record) => {
    if (record.labelList) {
      return <span style={{ color: '#000000a6' }}>{record.labelList.filter((e) => { return e.indexOf('http') < 0 }).join('， ')}</span>
    } else {
      return <span style={{ color: '#000000a6' }}>{record.object}</span>
    }
  },
}]

class KgTable extends React.Component {
  downLoad = () => {
    domtoimage.toJpeg(this.customTable, { quality: 1 })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `${this.props.forcename}_知识卡片_${moment().format('YYYY-MM-DD_HH-mm-ss')}.jpg`
        link.href = dataUrl
        link.click()
      })
  }

  render() {
    return (
      <div style={{ overflowY: 'scroll', height: 450 }}>
        <div ref={(e) => this.customTable = e}>
          <Table
            dataSource={this.props.dataSource}
            columns={columns}
            size="small"
            className={Styles.myTable}
            showHeader={false}
            pagination={false}
            style={{ backgroundColor: 'white' }}
            rowKey={(record) => record.propertyname}
          />
        </div>
      </div>
    )
  }
}
export default KgTable
