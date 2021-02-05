import React from 'react'
import { message, Pagination } from 'antd'
import Epub from '@/components/container/epubLink'
import { search } from '@/services/edukg'

export default class Books extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      current: 1,
      pageSize: 10,
      total: 0,
    }
  }

  UNSAFE_componentWillMount = () => {
    this.search()
  }

  showTotal = (total) => {
    const { current, pageSize } = this.state
    const target = current * pageSize
    return this.props.locale === 'cn' ? `共计 ${total} 条结果，当前第${target - pageSize + 1} - ${target}` : `Total: ${total}, now at ${target - pageSize + 1} - ${target}`
  }

  search = async () => {
    const { current, pageSize } = this.state
    this.setState({ dataSource: [] })
    const data = await search({
      searchKey: this.props.name,
      curPage: current,
      pageSize,
    })
    if (data.fullsearch) {
      const doc = []
      const video = []
      data.links.results.forEach((e) => {
        e.urilinks.forEach((i) => {
          if (i.sourcetype === '文档') {
            doc.push(i)
          } else {
            video.push(i)
          }
        })
      })
      await this.setState({
        dataSource: data.fullsearch.data.pager.rows,
        current: data.fullsearch.data.pager.curPage,
        pageSize: data.fullsearch.data.pager.pageSize,
        total: data.fullsearch.data.pager.totalCount,
      })
    } else {
      message.error('请求失败！')
    }
  }

  renderItem = (e, index) => {
    return (
      <div key={e.bookName + index} style={{ marginBottom: 20, overflow: 'hidden' }}>
        <h3>
          资源出处：《
          {e.bookName}
          》 /
          {' '}
          {e.htmlName}
        </h3>
        <div style={{ minHeight: 140, overflow: 'hidden' }}>
          <div style={{ float: 'left', marginRight: 10 }}>
            <img
              src={`http://kb.cs.tsinghua.edu.cn/apiresourceinfo/getcoverimg?resId=${e.bookId}`}
              alt="" height="140px"
              width="105px"
            />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <Epub htmlId={e.htmlId} list={e.content} searchKey={this.props.name} />
            <div style={{ fontSize: 12, color: '#b0b8b9' }}>
              <span>
                应用学科：
                {e.subject}
          &nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span>
                版本：
                {e.edition}
          &nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span>
                适用年级：
                {e.grade}
                年级&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span>
                出版时间：
                {e.editionTime}
          &nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span>
                ISBN：
                {e.isbn}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { dataSource, total, pageSize, current } = this.state
    return (
      <div>
        {dataSource.map(this.renderItem)}
        <Pagination
          total={total}
          size="small"
          showSizeChanger
          onShowSizeChange={this.onShowSizeChange}
          pageSize={pageSize}
          showQuickJumper
          showTotal={this.showTotal}
          onChange={this.pageChange}
          current={current}
          pageSizeOptions={['5', '10', '20']}
        />
      </div>
    )
  }
}
