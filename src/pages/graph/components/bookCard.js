import React from 'react'
import { Card, Skeleton } from 'antd'

export default class BookMasonry extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
    }
  }

  render() {
    const { loading } = this.state
    const {
      bookName, htmlName, bookId, htmlId, content, subject, edition, grade, editionTime, isbn,
    } = this.props.data
    return (
      <Card
        style={{ width: '30%', margin: '1%', borderRadius: 4, boxShadow: '4px 4px 4px #00000049', padding: 10 }}
      >
        <Skeleton loading={false} avatar active>
          <h4>
            资源出处：《
            {bookName}
            》 /
            {' '}
            {htmlName}
          </h4>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, color: '#b0b8b9', float: 'left', paddingTop: 10 }}>
              <div>
                应用学科：
                {subject}
            &nbsp;&nbsp;&nbsp;&nbsp;
              </div>
              <div>
                版本：
                {edition}
            &nbsp;&nbsp;&nbsp;&nbsp;
              </div>
              <div>
                适用年级：
                {grade}
                年级&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
              <div>
                出版时间：
                {editionTime}
            &nbsp;&nbsp;&nbsp;&nbsp;
              </div>
              <div>
                ISBN：
                {isbn}
              </div>
            </div>
            <div style={{ float: 'right', marginRight: 10 }}>
              <img
                src={`http://kb.cs.tsinghua.edu.cn/apiresourceinfo/getcoverimg?resId=${bookId}`}
                alt="" height="112px"
                width="84px"
              />
            </div>
          </div>
        </Skeleton>
      </Card>
    )
  }
}
