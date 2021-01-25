import React from 'react'
import { Table } from 'antd'
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
      return <span style={{ color: '#24afe6' }}>{record.labelList.filter((e) => { return e.indexOf('http') < 0 }).join('， ')}</span>
    } else {
      return <span style={{ color: '#24afe6' }}>{record.object}</span>
    }
  },
}]

class KgTable extends React.Component {
  render() {
    return (
      <Table
        dataSource={this.props.dataSource}
        columns={columns}
        size="small"
        className={Styles.myTable}
        showHeader={false}
        pagination={false}
        scroll={{ y: 450 }}
        rowKey={(record) => record.propertyname}
      />
    )
  }
}
export default KgTable
