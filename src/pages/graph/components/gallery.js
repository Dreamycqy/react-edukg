import React from 'react'
import { Modal, Button } from 'antd'
import _ from 'lodash'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

class Gallery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectImg: {
        src: '',
        index: 1,
      },
      modalVisible: false,
    }
  }

  chooseImg = (num) => {
    const { imgList } = this.state
    this.setState({
      modalVisible: true,
      selectImg: {
        index: num,
        src: imgList[num].object,
      },
    })
  }

  renderImg = (list) => {
    const result = []
    const { imgList } = this.state
    list.forEach((e) => {
      result.push(
        <div>
          <a href="javascript:;" onClick={() => this.chooseImg(_.findIndex(imgList, { object: e.object }))}>
            <img style={{ border: '1px solid #e8e8e8', margin: 20, objectFit: 'cover' }} src={e.object} alt="" height="220px" width="220px" />
          </a>
        </div>,
      )
    })
    return result
  }

  render() {
    const { selectImg, modalVisible } = this.state
    const { imgList } = this.props
    return (
      <div style={{ height: 280 }}>
        <Slider
          style={{ height: 260, backgroundColor: 'aliceblue' }}
          dots slidesPerRow={4}
          autoplay autoplaySpeed={3000}
        >
          {this.renderImg(imgList)}
        </Slider>
        <Modal
          title="相关图片"
          visible={modalVisible}
          footer={null}
          width="1000px"
          onCancel={() => this.setState({ modalVisible: false })}
        >
          <div style={{ marginTop: 20 }}>
            <div style={{ textAlign: 'center', minHeight: 320 }}>
              <img src={selectImg.src} alt="" style={{ maxHeight: 300 }} />
            </div>
            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <Button type="primary" style={{ marginRight: 20 }} disabled={selectImg.index === 0} onClick={() => this.chooseImg(selectImg.index - 1)}>前一张</Button>
              <span>
                第&nbsp;
                {selectImg.index + 1}
                &nbsp;
                /
                &nbsp;
                {imgList.length}
                &nbsp;张
              </span>
              <Button type="primary" style={{ marginLeft: 20 }} disabled={selectImg.index === imgList.length - 1} onClick={() => this.chooseImg(selectImg.index + 1)}>后一张</Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}
export default Gallery
